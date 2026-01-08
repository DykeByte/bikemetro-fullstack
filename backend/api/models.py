"""
Modelos de Django para el sistema BikeMetro
Archivo: backend/api/models.py
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

# ==================== USUARIO ====================
class Usuario(AbstractUser):
    """Usuario del sistema BikeMetro"""
    
    # Campos requeridos para registro
    # username será usado como 'nickname'
    # email es heredado de AbstractUser
    # first_name será usado como 'nombre'
    
    rut = models.CharField(
        max_length=12, 
        unique=True,
        help_text='RUT sin puntos, con guión (ej: 12345678-9)'
    )
    telefono = models.CharField(max_length=15)
    
    # Información de tarjeta Bip!
    numero_tarjeta_bip = models.CharField(
        max_length=20, 
        blank=True,
        help_text='Últimos 4 dígitos de la tarjeta'
    )
    
    # Campos de verificación
    email_verificado = models.BooleanField(default=False)
    telefono_verificado = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Campos heredados de AbstractUser que usaremos:
    # - username: será el 'nickname'
    # - email: correo electrónico
    # - first_name: nombre del usuario
    # - last_name: apellido (opcional)
    # - password: contraseña hasheada
    
    REQUIRED_FIELDS = ['email', 'rut', 'telefono', 'first_name']
    
    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        indexes = [
            models.Index(fields=['rut']),
            models.Index(fields=['email']),
            models.Index(fields=['username']),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.rut})"
    
    def clean(self):
        """Validar formato de RUT"""
        from django.core.exceptions import ValidationError
        if self.rut:
            # Validación básica de formato RUT
            import re
            if not re.match(r'^\d{7,8}-[\dkK]$', self.rut):
                raise ValidationError({
                    'rut': 'Formato de RUT inválido. Use formato: 12345678-9'
                })


# ==================== ESTACIÓN DE METRO ====================
class Estacion(models.Model):
    """Estaciones de Metro que cuentan con bicicletero"""
    
    LINEAS_CHOICES = [
        ('L1', 'Línea 1'),
        ('L2', 'Línea 2'),
        ('L3', 'Línea 3'),
        ('L4', 'Línea 4'),
        ('L4A', 'Línea 4A'),
        ('L5', 'Línea 5'),
        ('L6', 'Línea 6'),
        ('L7', 'Línea 7'),
    ]
    
    ESTADO_CHOICES = [
        ('ACTIVO', 'Activo'),
        ('INACTIVO', 'Inactivo'),
    ]
    
    nombre = models.CharField(max_length=100, unique=True)
    linea = models.CharField(max_length=3, choices=LINEAS_CHOICES, default='L1')
    
    # Estado operacional
    estado = models.CharField(
        max_length=10, 
        choices=ESTADO_CHOICES, 
        default='ACTIVO'
    )
    
    # Capacidad
    espacios_totales = models.IntegerField(default=42)  # 7 filas x 3 columnas x 2 lados
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'estaciones'
        verbose_name = 'Estación'
        verbose_name_plural = 'Estaciones'
        ordering = ['linea', 'nombre']
        indexes = [
            models.Index(fields=['linea', 'estado']),
        ]
    
    def __str__(self):
        return f"{self.nombre} ({self.linea})"
    
    @property
    def espacios_disponibles(self):
        """Calcula espacios disponibles en tiempo real"""
        espacios_ocupados = self.espacios.filter(
            estado__in=['OCUPADO', 'RESERVADO']
        ).count()
        
        return self.espacios_totales - espacios_ocupados
    
    @property
    def activo(self):
        """Compatibilidad: retorna True si estado es ACTIVO"""
        return self.estado == 'ACTIVO'


# ==================== ESPACIO DE ESTACIONAMIENTO ====================
class EspacioEstacionamiento(models.Model):
    """Espacios individuales dentro de una estación"""
    
    ESTADO_CHOICES = [
        ('DISPONIBLE', 'Disponible'),
        ('OCUPADO', 'Ocupado'),
        ('RESERVADO', 'Reservado'),
        ('MANTENIMIENTO', 'En Mantenimiento'),
    ]
    
    estacion = models.ForeignKey(
        Estacion,
        on_delete=models.CASCADE,
        related_name='espacios'
    )
    
    # Identificación del espacio según mockup (A1-C7)
    fila = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(7)],
        help_text='Número de fila (1-7)'
    )
    columna = models.CharField(
        max_length=1, 
        choices=[('A', 'A'), ('B', 'B'), ('C', 'C')],
        help_text='Columna A, B o C'
    )
    
    # Estado del espacio
    estado = models.CharField(
        max_length=15, 
        choices=ESTADO_CHOICES, 
        default='DISPONIBLE'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'espacios_estacionamiento'
        verbose_name = 'Espacio de Estacionamiento'
        verbose_name_plural = 'Espacios de Estacionamiento'
        unique_together = ['estacion', 'fila', 'columna']
        ordering = ['estacion', 'fila', 'columna']
        indexes = [
            models.Index(fields=['estacion', 'estado']),
        ]
    
    def __str__(self):
        return f"{self.estacion.nombre} - {self.codigo}"
    
    @property
    def codigo(self):
        """Código único del espacio (Ej: A1, B3, C7)"""
        return f"{self.columna}{self.fila}"


# ==================== RESERVA ====================
class Reserva(models.Model):
    """Reservas de espacios de estacionamiento"""
    
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),          # Reserva creada, esperando llegada
        ('CONFIRMADA', 'Confirmada'),        # Usuario llegó y escaneó QR
        ('EN_CURSO', 'En Curso'),            # Bicicleta estacionada
        ('FINALIZADA', 'Finalizada'),        # Usuario retiró bicicleta
        ('CANCELADA', 'Cancelada'),          # Usuario canceló
        ('EXPIRADA', 'Expirada'),            # Venció el tiempo de reserva
    ]
    
    # Identificador único
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Relaciones
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='reservas'
    )
    estacion = models.ForeignKey(
        Estacion,
        on_delete=models.CASCADE,
        related_name='reservas'
    )
    espacio = models.ForeignKey(
        EspacioEstacionamiento,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reservas'
    )
    
    # Estado y fechas
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='PENDIENTE')
    
    fecha_reserva = models.DateTimeField(auto_now_add=True)
    fecha_expiracion_reserva = models.DateTimeField()  # +10 minutos desde creación
    
    fecha_entrada = models.DateTimeField(null=True, blank=True)
    fecha_salida = models.DateTimeField(null=True, blank=True)
    
    # QR Codes (UUIDs únicos)
    qr_entrada = models.UUIDField(default=uuid.uuid4, editable=False)
    qr_salida = models.UUIDField(default=uuid.uuid4, editable=False)
    
    # Tarifas y pagos
    horas_gratis = models.IntegerField(default=2)  # 2 horas con pasaje metro
    costo_hora_extra = models.DecimalField(max_digits=8, decimal_places=2, default=500)
    costo_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    pagado = models.BooleanField(default=False)
    
    # Integración con pasaje metro
    pasaje_usado = models.BooleanField(default=False)
    
    # Notas
    notas = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'reservas'
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['usuario', 'estado']),
            models.Index(fields=['estacion', 'estado']),
            models.Index(fields=['qr_entrada']),
            models.Index(fields=['qr_salida']),
        ]
    
    def __str__(self):
        return f"Reserva {self.id} - {self.usuario.username} - {self.estado}"
    
    def calcular_costo(self):
        """Calcula el costo total basado en tiempo de uso"""
        if not self.fecha_entrada or not self.fecha_salida:
            return 0
        
        # Calcular horas transcurridas
        tiempo_uso = self.fecha_salida - self.fecha_entrada
        horas_totales = tiempo_uso.total_seconds() / 3600
        
        # Calcular horas extras (redondeando hacia arriba cada 30 min)
        horas_extras = max(0, horas_totales - self.horas_gratis)
        medias_horas_extras = int((horas_extras * 2) + 0.5)  # Redondeo hacia arriba
        
        costo = medias_horas_extras * (self.costo_hora_extra / 2)
        return round(costo, 2)
    
    def tiempo_restante_reserva(self):
        """Retorna segundos restantes de la reserva"""
        from django.utils import timezone
        if self.estado != 'PENDIENTE':
            return 0
        
        ahora = timezone.now()
        if ahora >= self.fecha_expiracion_reserva:
            return 0
        
        delta = self.fecha_expiracion_reserva - ahora
        return int(delta.total_seconds())
    
    def save(self, *args, **kwargs):
        """Override save para calcular fecha_expiracion_reserva automáticamente"""
        from django.utils import timezone
        from datetime import timedelta
        
        # Si es una reserva nueva (no tiene pk aún)
        if not self.pk:
            # Calcular fecha de expiración (10 minutos desde ahora)
            self.fecha_expiracion_reserva = timezone.now() + timedelta(minutes=10)
            
            # Actualizar estado del espacio a RESERVADO
            if self.espacio:
                self.espacio.estado = 'RESERVADO'
                self.espacio.save()
        
        super().save(*args, **kwargs)

# ==================== PAGO ====================
class Pago(models.Model):
    """Registro de pagos realizados"""
    
    METODO_CHOICES = [
        ('TARJETA_BIP', 'Tarjeta Bip!'),
        ('TARJETA_DEBITO', 'Tarjeta de Débito'),
        ('TARJETA_CREDITO', 'Tarjeta de Crédito'),
        ('EFECTIVO', 'Efectivo'),
    ]
    
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('APROBADO', 'Aprobado'),
        ('RECHAZADO', 'Rechazado'),
        ('REEMBOLSADO', 'Reembolsado'),
    ]
    
    reserva = models.OneToOneField(
        Reserva,
        on_delete=models.CASCADE,
        related_name='pago'
    )
    
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    metodo_pago = models.CharField(max_length=20, choices=METODO_CHOICES)
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='PENDIENTE')
    
    # Información de transacción
    transaccion_id = models.CharField(max_length=100, blank=True)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    
    # Recibo
    numero_recibo = models.CharField(max_length=50, unique=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'pagos'
        verbose_name = 'Pago'
        verbose_name_plural = 'Pagos'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Pago {self.numero_recibo} - ${self.monto}"
    
    def save(self, *args, **kwargs):
        if not self.numero_recibo:
            # Generar número de recibo único
            import datetime
            fecha = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
            self.numero_recibo = f"REC-{fecha}-{self.reserva.id.hex[:8]}"
        super().save(*args, **kwargs)


# ==================== RESEÑA ====================
class Resena(models.Model):
    """Reseñas y calificaciones de estaciones"""
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='resenas'
    )
    estacion = models.ForeignKey(
        Estacion,
        on_delete=models.CASCADE,
        related_name='resenas'
    )
    reserva = models.OneToOneField(
        Reserva,
        on_delete=models.CASCADE,
        related_name='resena',
        null=True,
        blank=True
    )
    
    # Calificación (1-5 estrellas)
    calificacion = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    # Comentario
    comentario = models.TextField(blank=True)
    
    # Aspectos específicos (1-5)
    calificacion_seguridad = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    calificacion_limpieza = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    calificacion_accesibilidad = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True,
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'resenas'
        verbose_name = 'Reseña'
        verbose_name_plural = 'Reseñas'
        ordering = ['-created_at']
        unique_together = ['usuario', 'reserva']
    
    def __str__(self):
        return f"{self.usuario.username} - {self.estacion.nombre} ({self.calificacion}⭐)"


# ==================== NOTIFICACIÓN ====================
class Notificacion(models.Model):
    """Notificaciones push para usuarios"""
    
    TIPO_CHOICES = [
        ('RESERVA_CONFIRMADA', 'Reserva Confirmada'),
        ('RESERVA_PROXIMA_EXPIRACION', 'Reserva Próxima a Expirar'),
        ('RESERVA_EXPIRADA', 'Reserva Expirada'),
        ('PAGO_REQUERIDO', 'Pago Requerido'),
        ('PAGO_EXITOSO', 'Pago Exitoso'),
        ('RECORDATORIO', 'Recordatorio'),
        ('SISTEMA', 'Sistema'),
    ]
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='notificaciones'
    )
    
    tipo = models.CharField(max_length=30, choices=TIPO_CHOICES)
    titulo = models.CharField(max_length=200)
    mensaje = models.TextField()
    
    # Estado
    leida = models.BooleanField(default=False)
    fecha_leida = models.DateTimeField(null=True, blank=True)
    
    # Relaciones opcionales
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notificaciones'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notificaciones'
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.usuario.username} - {self.tipo}"


# ==================== TICKET DE SOPORTE ====================
class TicketSoporte(models.Model):
    """Tickets de soporte técnico"""
    
    TIPO_CHOICES = [
        ('PROBLEMA_TECNICO', 'Problema Técnico'),
        ('PROBLEMA_PAGO', 'Problema de Pago'),
        ('PROBLEMA_QR', 'Problema con QR'),
        ('CONSULTA', 'Consulta General'),
        ('SUGERENCIA', 'Sugerencia'),
        ('OTRO', 'Otro'),
    ]
    
    ESTADO_CHOICES = [
        ('ABIERTO', 'Abierto'),
        ('EN_PROCESO', 'En Proceso'),
        ('RESUELTO', 'Resuelto'),
        ('CERRADO', 'Cerrado'),
    ]
    
    PRIORIDAD_CHOICES = [
        ('BAJA', 'Baja'),
        ('MEDIA', 'Media'),
        ('ALTA', 'Alta'),
        ('URGENTE', 'Urgente'),
    ]
    
    # Identificador único
    numero_ticket = models.CharField(max_length=20, unique=True, blank=True)
    
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='tickets'
    )
    
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    prioridad = models.CharField(max_length=10, choices=PRIORIDAD_CHOICES, default='MEDIA')
    estado = models.CharField(max_length=15, choices=ESTADO_CHOICES, default='ABIERTO')
    
    asunto = models.CharField(max_length=200)
    descripcion = models.TextField()
    
    # Relaciones opcionales
    reserva = models.ForeignKey(
        Reserva,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tickets'
    )
    
    # Resolución
    fecha_resolucion = models.DateTimeField(null=True, blank=True)
    respuesta = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tickets_soporte'
        verbose_name = 'Ticket de Soporte'
        verbose_name_plural = 'Tickets de Soporte'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.numero_ticket} - {self.asunto}"
    
    def save(self, *args, **kwargs):
        if not self.numero_ticket:
            # Generar número de ticket único
            import datetime
            fecha = datetime.datetime.now().strftime('%Y%m%d')
            count = TicketSoporte.objects.filter(
                created_at__date=datetime.datetime.now().date()
            ).count() + 1
            self.numero_ticket = f"TKT-{fecha}-{count:04d}"
        super().save(*args, **kwargs)
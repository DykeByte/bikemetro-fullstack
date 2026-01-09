"""
Serializers para la API de BikeMetro
Archivo: backend/api/serializers.py
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import (
    Estacion, EspacioEstacionamiento, Reserva, 
    Pago, Resena, Notificacion, TicketSoporte
)
import re

Usuario = get_user_model()


# ============ VALIDADORES PERSONALIZADOS ============
def validar_rut(value):
    """Validar formato de RUT chileno"""
    if not re.match(r'^\d{7,8}-[\dkK]$', value):
        raise serializers.ValidationError(
            'Formato de RUT inválido. Debe ser: 12345678-9'
        )
    return value


# ============ USUARIO SERIALIZERS ============
class UsuarioRegistroSerializer(serializers.ModelSerializer):
    """Serializer para registro de nuevos usuarios"""
    
    password = serializers.CharField(
        write_only=True, 
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    # nickname se mapea a username
    nickname = serializers.CharField(source='username', required=True)
    nombre = serializers.CharField(source='first_name', required=True)
    
    class Meta:
        model = Usuario
        fields = [
            'nickname',      # Mapea a username
            'nombre',        # Mapea a first_name
            'email',
            'rut',
            'telefono',
            'password',
            'password_confirm',
        ]
        extra_kwargs = {
            'email': {'required': True},
            'rut': {'required': True, 'validators': [validar_rut]},
            'telefono': {'required': True},
        }
    
    def validate(self, data):
        """Validaciones personalizadas"""
        # Validar que las contraseñas coincidan
        if data['password'] != self.initial_data.get('password_confirm'):
            raise serializers.ValidationError({
                'password_confirm': 'Las contraseñas no coinciden'
            })
        
        # Validar unicidad de RUT
        if Usuario.objects.filter(rut=data['rut']).exists():
            raise serializers.ValidationError({
                'rut': 'Este RUT ya está registrado'
            })
        
        return data
    
    def create(self, validated_data):
        """Crear usuario con contraseña hasheada"""
        # Remover password_confirm
        validated_data.pop('password_confirm', None)
        
        # Crear usuario
        user = Usuario.objects.create_user(**validated_data)
        return user


class UsuarioLoginSerializer(serializers.Serializer):
    """Serializer para login (múltiples opciones)"""
    
    # El usuario puede ingresar con email, rut o nickname
    login = serializers.CharField(
        required=True,
        help_text='Email, RUT o Nickname'
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )
    
    def validate(self, data):
        """Validar credenciales y encontrar usuario"""
        login = data.get('login')
        password = data.get('password')
        
        # Intentar encontrar usuario por email, rut o username
        user = None
        
        # Verificar si es email
        if '@' in login:
            try:
                user = Usuario.objects.get(email=login)
            except Usuario.DoesNotExist:
                pass
        
        # Verificar si es RUT
        elif '-' in login:
            try:
                user = Usuario.objects.get(rut=login)
            except Usuario.DoesNotExist:
                pass
        
        # Asumir que es username (nickname)
        else:
            try:
                user = Usuario.objects.get(username=login)
            except Usuario.DoesNotExist:
                pass
        
        # Validar usuario y contraseña
        if user is None or not user.check_password(password):
            raise serializers.ValidationError(
                'Credenciales inválidas'
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'Cuenta desactivada'
            )
        
        data['user'] = user
        return data


class UsuarioPerfilSerializer(serializers.ModelSerializer):
    """Serializer para perfil de usuario (datos personales)"""
    
    nickname = serializers.CharField(source='username', read_only=True)
    nombre = serializers.CharField(source='first_name')
    
    class Meta:
        model = Usuario
        fields = [
            'id',
            'nickname',
            'nombre',
            'email',
            'rut',
            'telefono',
            'numero_tarjeta_bip',
            'email_verificado',
            'telefono_verificado',
        ]
        read_only_fields = [
            'id',
            'nickname',
            'rut',  # RUT no se puede cambiar
            'email_verificado',
            'telefono_verificado',
        ]


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializer básico de usuario"""
    
    nickname = serializers.CharField(source='username', read_only=True)
    nombre = serializers.CharField(source='first_name', read_only=True)
    
    class Meta:
        model = Usuario
        fields = ['id', 'nickname', 'nombre', 'email']


# ============ ESPACIO SERIALIZERS ============
class EspacioEstacionamientoSerializer(serializers.ModelSerializer):
    """Serializer para espacios de estacionamiento"""
    
    codigo = serializers.ReadOnlyField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = EspacioEstacionamiento
        fields = [
            'id',
            'fila',
            'columna',
            'codigo',
            'estado',
            'estado_display',
        ]
        read_only_fields = ['id', 'codigo']


# ============ ESTACIÓN SERIALIZERS ============
class EstacionListSerializer(serializers.ModelSerializer):
    """Serializer para lista de estaciones"""
    
    espacios_disponibles = serializers.ReadOnlyField()
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    linea_display = serializers.CharField(source='get_linea_display', read_only=True)
    
    class Meta:
        model = Estacion
        fields = [
            'id',
            'nombre',
            'linea',
            'linea_display',
            'latitud',
            'longitud',
            'estado',
            'estado_display',
            'espacios_totales',
            'espacios_disponibles',
        ]

class EstacionDetailSerializer(serializers.ModelSerializer):
    """Serializer detallado de estación con sus espacios"""
    
    espacios_disponibles = serializers.ReadOnlyField()
    espacios = EspacioEstacionamientoSerializer(many=True, read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    linea_display = serializers.CharField(source='get_linea_display', read_only=True)
    
    # Agrupar espacios por estado para facilitar visualización
    espacios_por_estado = serializers.SerializerMethodField()
    
    class Meta:
        model = Estacion
        fields = [
            'id',
            'nombre',
            'linea',
            'linea_display',
            'estado',
            'estado_display',
            'espacios_totales',
            'espacios_disponibles',
            'espacios',
            'espacios_por_estado',
            'created_at',
            'updated_at',
        ]
    
    def get_espacios_por_estado(self, obj):
        """Contar espacios agrupados por estado"""
        from django.db.models import Count
        return obj.espacios.values('estado').annotate(
            cantidad=Count('id')
        )


# ============ RESERVA SERIALIZERS ============
class ReservaCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear reservas"""
    
    class Meta:
        model = Reserva
        fields = ['estacion', 'espacio']
    
    def validate(self, data):
        """Validaciones personalizadas"""
        espacio = data['espacio']
        
        # Validar que el espacio esté disponible
        if espacio.estado != 'DISPONIBLE':
            raise serializers.ValidationError(
                "Este espacio no está disponible"
            )
        
        # Validar que el espacio pertenezca a la estación
        if espacio.estacion != data['estacion']:
            raise serializers.ValidationError(
                "El espacio no pertenece a esta estación"
            )
        
        return data
    
    def create(self, validated_data):
        """Crear reserva calculando todos los campos necesarios"""
        from django.utils import timezone
        from datetime import timedelta
        
        # Agregar el usuario del contexto
        usuario = self.context['request'].user
        estacion = validated_data['estacion']
        espacio = validated_data['espacio']
        
        # Calcular fecha de expiración (10 minutos desde ahora)
        fecha_expiracion = timezone.now() + timedelta(minutes=10)
        
        # Crear la reserva con todos los campos
        reserva = Reserva.objects.create(
            usuario=usuario,
            estacion=estacion,
            espacio=espacio,
            fecha_expiracion_reserva=fecha_expiracion,
            estado='PENDIENTE'
        )
        
        # Actualizar estado del espacio a RESERVADO
        espacio.estado = 'RESERVADO'
        espacio.save()
        
        return reserva

class ReservaSerializer(serializers.ModelSerializer):
    """Serializer completo de reserva"""
    
    estacion_nombre = serializers.CharField(source='estacion.nombre', read_only=True)
    espacio_codigo = serializers.CharField(source='espacio.codigo', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Reserva
        fields = [
            'id', 'usuario', 'estacion', 'estacion_nombre', 
            'espacio', 'espacio_codigo', 'estado', 'estado_display',
            'fecha_reserva', 'fecha_expiracion_reserva',
            'fecha_entrada', 'fecha_salida',
            'qr_entrada', 'qr_salida',
            'horas_gratis', 'costo_hora_extra', 'costo_total',
            'pagado', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'usuario', 'qr_entrada', 'qr_salida',
            'costo_total', 'created_at', 'updated_at',
            'estacion_nombre', 'espacio_codigo', 'estado_display'
        ]


class ReservaListSerializer(serializers.ModelSerializer):
    """Serializer resumido para lista de reservas"""
    
    estacion_nombre = serializers.CharField(source='estacion.nombre', read_only=True)
    espacio_codigo = serializers.CharField(source='espacio.codigo', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = Reserva
        fields = [
            'id', 'estacion', 'estacion_nombre', 
            'espacio', 'espacio_codigo',
            'estado', 'estado_display',
            'fecha_reserva', 'fecha_expiracion_reserva',
            'costo_total', 'pagado'
        ]


# ============ PAGO SERIALIZERS ============
class PagoSerializer(serializers.ModelSerializer):
    """Serializer para pagos"""
    
    metodo_pago_display = serializers.CharField(
        source='get_metodo_pago_display',
        read_only=True
    )
    estado_display = serializers.CharField(
        source='get_estado_display',
        read_only=True
    )
    
    class Meta:
        model = Pago
        fields = [
            'id',
            'reserva',
            'monto',
            'metodo_pago',
            'metodo_pago_display',
            'estado',
            'estado_display',
            'numero_recibo',
            'fecha_pago',
        ]
        read_only_fields = [
            'id',
            'numero_recibo',
            'fecha_pago',
        ]


# ============ RESEÑA SERIALIZERS ============
class ResenaSerializer(serializers.ModelSerializer):
    """Serializer para reseñas"""
    
    usuario = UsuarioSerializer(read_only=True)
    estacion_nombre = serializers.CharField(
        source='estacion.nombre',
        read_only=True
    )
    
    class Meta:
        model = Resena
        fields = [
            'id',
            'usuario',
            'estacion',
            'estacion_nombre',
            'reserva',
            'calificacion',
            'comentario',
            'calificacion_seguridad',
            'calificacion_limpieza',
            'calificacion_accesibilidad',
            'created_at',
        ]
        read_only_fields = ['id', 'usuario', 'created_at']
    
    def create(self, validated_data):
        """Asignar usuario automáticamente"""
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)


# ============ NOTIFICACIÓN SERIALIZERS ============
class NotificacionSerializer(serializers.ModelSerializer):
    """Serializer para notificaciones"""
    
    tipo_display = serializers.CharField(
        source='get_tipo_display',
        read_only=True
    )
    
    class Meta:
        model = Notificacion
        fields = [
            'id',
            'tipo',
            'tipo_display',
            'titulo',
            'mensaje',
            'leida',
            'fecha_leida',
            'reserva',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'usuario',
            'fecha_leida',
            'created_at',
        ]


# ============ TICKET SOPORTE SERIALIZERS ============
class TicketSoporteSerializer(serializers.ModelSerializer):
    """Serializer para tickets de soporte"""
    
    usuario = UsuarioSerializer(read_only=True)
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    prioridad_display = serializers.CharField(source='get_prioridad_display', read_only=True)
    
    class Meta:
        model = TicketSoporte
        fields = [
            'id',
            'numero_ticket',
            'usuario',
            'tipo',
            'tipo_display',
            'prioridad',
            'prioridad_display',
            'estado',
            'estado_display',
            'asunto',
            'descripcion',
            'reserva',
            'fecha_resolucion',
            'respuesta',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'numero_ticket',
            'usuario',
            'fecha_resolucion',
            'created_at',
            'updated_at',
        ]
    
    def create(self, validated_data):
        """Asignar usuario automáticamente"""
        validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)

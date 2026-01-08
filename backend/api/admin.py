"""
Configuración del Panel de Administración de Django
Archivo: backend/api/admin.py
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    Usuario, Estacion, EspacioEstacionamiento,
    Reserva, Pago, Resena, Notificacion, TicketSoporte
)


# ============ USUARIO ADMIN ============
@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """Configuración del admin para Usuario"""
    
    list_display = ['username', 'email', 'rut', 'telefono', 'is_active', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'email_verificado', 'date_joined']
    search_fields = ['username', 'email', 'rut', 'first_name', 'last_name']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Información Adicional', {
            'fields': ('rut', 'telefono', 'numero_tarjeta_bip')
        }),
        ('Verificación', {
            'fields': ('email_verificado', 'telefono_verificado')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información Adicional', {
            'fields': ('email', 'first_name', 'rut', 'telefono')
        }),
    )


# ============ ESTACIÓN ADMIN ============
class EspacioInline(admin.TabularInline):
    """Inline para mostrar espacios en la estación"""
    model = EspacioEstacionamiento
    extra = 0
    fields = ['fila', 'columna', 'estado', 'codigo']
    readonly_fields = ['codigo']
    can_delete = False


@admin.register(Estacion)
class EstacionAdmin(admin.ModelAdmin):
    """Configuración del admin para Estacion"""
    
    list_display = ['nombre', 'linea', 'estado', 'espacios_totales', 'espacios_disponibles', 'created_at']
    list_filter = ['linea', 'estado']
    search_fields = ['nombre']
    readonly_fields = ['espacios_disponibles', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('nombre', 'linea', 'estado')
        }),
        ('Capacidad', {
            'fields': ('espacios_totales', 'espacios_disponibles')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [EspacioInline]


# ============ ESPACIO ADMIN ============
@admin.register(EspacioEstacionamiento)
class EspacioEstacionamientoAdmin(admin.ModelAdmin):
    """Configuración del admin para EspacioEstacionamiento"""
    
    list_display = ['__str__', 'estacion', 'fila', 'columna', 'estado', 'codigo']
    list_filter = ['estado', 'estacion', 'fila']
    search_fields = ['estacion__nombre']
    readonly_fields = ['codigo']
    
    fieldsets = (
        ('Ubicación', {
            'fields': ('estacion', 'fila', 'columna', 'codigo')
        }),
        ('Estado', {
            'fields': ('estado',)
        }),
    )


# ============ RESERVA ADMIN ============
@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    """Configuración del admin para Reserva"""
    
    list_display = [
        'id', 'usuario', 'estacion', 'espacio', 
        'estado', 'fecha_reserva', 'costo_total', 'pagado'
    ]
    list_filter = ['estado', 'pagado', 'fecha_reserva', 'estacion']
    search_fields = ['usuario__username', 'usuario__email', 'estacion__nombre']
    readonly_fields = [
        'id', 'qr_entrada', 'qr_salida', 
        'costo_total', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Usuario y Ubicación', {
            'fields': ('usuario', 'estacion', 'espacio')
        }),
        ('Estado', {
            'fields': ('estado', 'pagado')
        }),
        ('Fechas', {
            'fields': (
                'fecha_reserva', 'fecha_expiracion_reserva',
                'fecha_entrada', 'fecha_salida'
            )
        }),
        ('QR Codes', {
            'fields': ('qr_entrada', 'qr_salida'),
            'classes': ('collapse',)
        }),
        ('Pago', {
            'fields': ('horas_gratis', 'costo_hora_extra', 'costo_total')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'fecha_reserva'


# ============ PAGO ADMIN ============
@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    """Configuración del admin para Pago"""
    
    list_display = [
        'numero_recibo', 'reserva', 'monto', 
        'metodo_pago', 'estado', 'fecha_pago'
    ]
    list_filter = ['estado', 'metodo_pago', 'fecha_pago']
    search_fields = ['numero_recibo', 'transaccion_id', 'reserva__usuario__username']
    readonly_fields = ['numero_recibo', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Reserva', {
            'fields': ('reserva',)
        }),
        ('Pago', {
            'fields': ('monto', 'metodo_pago', 'estado')
        }),
        ('Transacción', {
            'fields': ('numero_recibo', 'transaccion_id', 'fecha_pago')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'fecha_pago'


# ============ RESEÑA ADMIN ============
@admin.register(Resena)
class ResenaAdmin(admin.ModelAdmin):
    """Configuración del admin para Resena"""
    
    list_display = [
        'usuario', 'estacion', 'calificacion', 
        'created_at'
    ]
    list_filter = ['calificacion', 'estacion', 'created_at']
    search_fields = ['usuario__username', 'estacion__nombre', 'comentario']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Usuario y Estación', {
            'fields': ('usuario', 'estacion', 'reserva')
        }),
        ('Calificación', {
            'fields': (
                'calificacion', 'comentario',
                'calificacion_seguridad', 'calificacion_limpieza',
                'calificacion_accesibilidad'
            )
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# ============ NOTIFICACIÓN ADMIN ============
@admin.register(Notificacion)
class NotificacionAdmin(admin.ModelAdmin):
    """Configuración del admin para Notificacion"""
    
    list_display = ['usuario', 'tipo', 'titulo', 'leida', 'created_at']
    list_filter = ['tipo', 'leida', 'created_at']
    search_fields = ['usuario__username', 'titulo', 'mensaje']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Destinatario', {
            'fields': ('usuario',)
        }),
        ('Contenido', {
            'fields': ('tipo', 'titulo', 'mensaje')
        }),
        ('Estado', {
            'fields': ('leida', 'fecha_leida')
        }),
        ('Relaciones', {
            'fields': ('reserva',)
        }),
    )
    
    date_hierarchy = 'created_at'


# ============ TICKET SOPORTE ADMIN ============
@admin.register(TicketSoporte)
class TicketSoporteAdmin(admin.ModelAdmin):
    """Configuración del admin para TicketSoporte"""
    
    list_display = [
        'numero_ticket', 'usuario', 'tipo', 
        'prioridad', 'estado', 'created_at'
    ]
    list_filter = ['tipo', 'prioridad', 'estado', 'created_at']
    search_fields = [
        'numero_ticket', 'usuario__username', 
        'asunto', 'descripcion'
    ]
    readonly_fields = ['numero_ticket', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Ticket', {
            'fields': ('numero_ticket', 'usuario', 'tipo', 'prioridad', 'estado')
        }),
        ('Detalles', {
            'fields': ('asunto', 'descripcion', 'reserva')
        }),
        ('Resolución', {
            'fields': ('fecha_resolucion', 'respuesta')
        }),
        ('Metadatos', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'created_at'
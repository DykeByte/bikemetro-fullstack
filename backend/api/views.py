"""
ViewSets para la API REST de BikeMetro
Archivo: backend/api/views.py
"""

from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta
from django.contrib.auth import get_user_model

Usuario = get_user_model()


from .models import (
    Usuario, Estacion, EspacioEstacionamiento, 
    Reserva, Pago, Resena, Notificacion, TicketSoporte
)
from .serializers import (
    UsuarioSerializer, UsuarioPerfilSerializer, UsuarioRegistroSerializer,
    EstacionListSerializer, EstacionDetailSerializer,
    EspacioEstacionamientoSerializer,
    ReservaSerializer, ReservaCreateSerializer, ReservaListSerializer,
    PagoSerializer, ResenaSerializer,
    NotificacionSerializer, TicketSoporteSerializer
)


# ============ USUARIO VIEWS ============
class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para gestión de usuarios"""
    serializer_class = UsuarioPerfilSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Solo el propio usuario"""
        return Usuario.objects.filter(id=self.request.user.id)
    
    @action(detail=False, methods=['get', 'patch', 'put'])
    def me(self, request):
        """
        Obtener o actualizar perfil del usuario actual
        GET /api/usuarios/me/
        PATCH /api/usuarios/me/
        PUT /api/usuarios/me/
        """
        user = request.user
        
        if request.method == 'GET':
            serializer = UsuarioPerfilSerializer(user)
            return Response(serializer.data)
        
        elif request.method in ['PATCH', 'PUT']:
            partial = request.method == 'PATCH'
            serializer = UsuarioPerfilSerializer(
                user,
                data=request.data,
                partial=partial
            )
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response(
            {'error': 'Método no permitido'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


# ============ ESTACIÓN VIEWS ============
class EstacionViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para estaciones (solo lectura)"""
    queryset = Estacion.objects.filter(estado='ACTIVO').order_by('linea', 'nombre')
    serializer_class = EstacionListSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None  # Desactivar paginación para estaciones
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EstacionDetailSerializer
        return EstacionListSerializer
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny])
    def espacios(self, request, pk=None):
        """Obtener espacios de una estación"""
        estacion = self.get_object()
        espacios = estacion.espacios.all().order_by('fila', 'columna')
        serializer = EspacioEstacionamientoSerializer(espacios, many=True)
        return Response(serializer.data)

# ============ RESERVA VIEWS ============
class ReservaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de reservas
    
    list: Listar reservas del usuario
    create: Crear nueva reserva
    retrieve: Ver detalle de una reserva
    update: Actualizar reserva
    destroy: Eliminar reserva
    
    Acciones adicionales:
    - activas: Listar reservas activas
    - historial: Ver historial de reservas
    - confirmar: Confirmar llegada (escanear QR entrada)
    - finalizar: Finalizar y pagar (escanear QR salida)
    - cancelar: Cancelar reserva
    """
    serializer_class = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Solo reservas del usuario actual"""
        return Reserva.objects.filter(usuario=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        """Serializer según la acción"""
        if self.action == 'create':
            return ReservaCreateSerializer
        elif self.action == 'list':
            return ReservaListSerializer
        return ReservaSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create para devolver respuesta completa con datos relacionados"""
        # Usar ReservaCreateSerializer para validar y crear
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()
        
        # Recargar instancia con select_related para obtener datos completos
        instance = Reserva.objects.select_related(
            'estacion', 'espacio', 'usuario'
        ).get(pk=instance.pk)
        
        # Usar ReservaSerializer completo para la respuesta
        response_serializer = ReservaSerializer(instance)
        
        headers = self.get_success_headers(response_serializer.data)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )


    @action(detail=False, methods=['get'])
    def activas(self, request):
        """
        Obtener reservas activas del usuario
        GET /api/reservas/activas/
        """
        reservas = self.get_queryset().filter(
            estado__in=['PENDIENTE', 'CONFIRMADA', 'EN_CURSO']
        )
        serializer = ReservaListSerializer(reservas, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def historial(self, request):
        """
        Obtener historial de reservas finalizadas
        GET /api/reservas/historial/
        """
        reservas = self.get_queryset().filter(
            estado__in=['FINALIZADA', 'CANCELADA', 'EXPIRADA']
        )
        serializer = ReservaListSerializer(reservas, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def confirmar(self, request, pk=None):
        """
        Confirmar llegada a la estación (escanear QR de entrada)
        POST /api/reservas/{id}/confirmar/
        Body: {"qr_code": "uuid-del-qr"}
        """
        reserva = self.get_object()
        
        if reserva.estado != 'PENDIENTE':
            return Response(
                {'error': 'La reserva no está en estado pendiente'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar QR
        qr_code = request.data.get('qr_code')
        if str(reserva.qr_entrada) != qr_code:
            return Response(
                {'error': 'Código QR inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que no haya expirado
        if timezone.now() > reserva.fecha_expiracion_reserva:
            reserva.estado = 'EXPIRADA'
            reserva.save()
            # Liberar espacio
            if reserva.espacio:
                reserva.espacio.estado = 'DISPONIBLE'
                reserva.espacio.save()
            return Response(
                {'error': 'La reserva ha expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Actualizar reserva
        reserva.estado = 'CONFIRMADA'
        reserva.fecha_entrada = timezone.now()
        reserva.save()
        
        # Actualizar espacio
        if reserva.espacio:
            reserva.espacio.estado = 'OCUPADO'
            reserva.espacio.save()
        
        serializer = self.get_serializer(reserva)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        """
        Finalizar reserva y generar cobro (escanear QR de salida)
        POST /api/reservas/{id}/finalizar/
        Body: {"qr_code": "uuid-del-qr"}
        """
        reserva = self.get_object()
        
        if reserva.estado not in ['CONFIRMADA', 'EN_CURSO']:
            return Response(
                {'error': 'La reserva no puede ser finalizada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar QR
        qr_code = request.data.get('qr_code')
        if str(reserva.qr_salida) != qr_code:
            return Response(
                {'error': 'Código QR inválido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calcular costo
        reserva.fecha_salida = timezone.now()
        reserva.costo_total = reserva.calcular_costo()
        reserva.estado = 'FINALIZADA'
        reserva.save()
        
        # Liberar espacio
        if reserva.espacio:
            reserva.espacio.estado = 'DISPONIBLE'
            reserva.espacio.save()
        
        serializer = self.get_serializer(reserva)
        return Response({
            'reserva': serializer.data,
            'mensaje': f'Reserva finalizada. Costo total: ${reserva.costo_total}'
        })
    
    @action(detail=True, methods=['post'])
    def cancelar(self, request, pk=None):
        """
        Cancelar una reserva
        POST /api/reservas/{id}/cancelar/
        """
        reserva = self.get_object()
        
        if reserva.estado not in ['PENDIENTE', 'CONFIRMADA']:
            return Response(
                {'error': 'La reserva no puede ser cancelada'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        reserva.estado = 'CANCELADA'
        reserva.save()
        
        # Liberar espacio
        if reserva.espacio:
            reserva.espacio.estado = 'DISPONIBLE'
            reserva.espacio.save()
        
        return Response({
            'mensaje': 'Reserva cancelada exitosamente'
        })


# ============ PAGO VIEWS ============
class PagoViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consulta de pagos (solo lectura)
    Los pagos se generan automáticamente al finalizar reservas
    """
    serializer_class = PagoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Solo pagos del usuario actual"""
        return Pago.objects.filter(
            reserva__usuario=self.request.user
        ).order_by('-created_at')


# ============ RESEÑA VIEWS ============
class ResenaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de reseñas
    """
    serializer_class = ResenaSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar por estación si se especifica"""
        queryset = Resena.objects.all()
        estacion_id = self.request.query_params.get('estacion', None)
        if estacion_id:
            queryset = queryset.filter(estacion_id=estacion_id)
        return queryset.order_by('-created_at')


# ============ NOTIFICACIÓN VIEWS ============
class NotificacionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para consulta de notificaciones
    """
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Solo notificaciones del usuario actual"""
        return Notificacion.objects.filter(
            usuario=self.request.user
        ).order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        """
        Marcar notificación como leída
        POST /api/notificaciones/{id}/marcar_leida/
        """
        notificacion = self.get_object()
        notificacion.leida = True
        notificacion.fecha_leida = timezone.now()
        notificacion.save()
        
        serializer = self.get_serializer(notificacion)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def marcar_todas_leidas(self, request):
        """
        Marcar todas las notificaciones como leídas
        POST /api/notificaciones/marcar_todas_leidas/
        """
        self.get_queryset().update(
            leida=True,
            fecha_leida=timezone.now()
        )
        return Response({'mensaje': 'Todas las notificaciones marcadas como leídas'})


# ============ TICKET SOPORTE VIEWS ============
class TicketSoporteViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestión de tickets de soporte
    """
    serializer_class = TicketSoporteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Solo tickets del usuario actual"""
        return TicketSoporte.objects.filter(
            usuario=self.request.user
        ).order_by('-created_at')
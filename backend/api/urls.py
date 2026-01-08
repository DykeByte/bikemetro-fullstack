"""
URLs de la API de BikeMetro
Archivo: backend/api/urls.py
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    UsuarioViewSet,
    EstacionViewSet,
    ReservaViewSet,
    PagoViewSet,
    ResenaViewSet,
    NotificacionViewSet,
    TicketSoporteViewSet,
)

# Router para los ViewSets
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet, basename='usuario')
router.register(r'estaciones', EstacionViewSet, basename='estacion')
router.register(r'reservas', ReservaViewSet, basename='reserva')
router.register(r'pagos', PagoViewSet, basename='pago')
router.register(r'resenas', ResenaViewSet, basename='resena')
router.register(r'notificaciones', NotificacionViewSet, basename='notificacion')
router.register(r'tickets', TicketSoporteViewSet, basename='ticket')

urlpatterns = [
    # Autenticación JWT
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', UsuarioViewSet.as_view({'post': 'create'}), name='register'),
    
    # Rutas del router
    path('', include(router.urls)),
]
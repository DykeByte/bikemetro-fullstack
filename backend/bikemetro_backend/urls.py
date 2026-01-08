"""
URLs principales del proyecto BikeMetro
Archivo: backend/bikemetro_backend/urls.py
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions

urlpatterns = [
    # Panel de administración
    path('admin/', admin.site.urls),
    
    # API REST
    path('api/', include('api.urls')),
    
    # API REST Framework (navegador)
    path('api-auth/', include('rest_framework.urls')),
]

# Configuración para servir archivos media en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# Personalizar títulos del admin
admin.site.site_header = "BikeMetro Administración"
admin.site.site_title = "BikeMetro Admin"
admin.site.index_title = "Bienvenido al Panel de Administración"
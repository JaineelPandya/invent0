"""
URL configuration for core project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API Root - Lists all available endpoints"""
    return Response({
        'message': 'Invento - Inventory Management System API',
        'endpoints': {
            'accounts': {
                'register': '/api/accounts/register/',
                'login': '/api/accounts/login/',
                'logout': '/api/accounts/logout/',
                'refresh': '/api/accounts/token/refresh/',
                'profile': '/api/accounts/profile/',
            },
            'inventory': '/api/inventory/',
            'dashboard': '/api/dashboard/',
            'reports': '/api/reports/',
            'admin': '/admin/',
        }
    })


urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/accounts/', include('accounts.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/reports/', include('reports.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

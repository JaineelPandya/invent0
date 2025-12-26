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
from django.views.generic import TemplateView


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
    # Main Single Page Application - serves all frontend routes
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('dashboard/', TemplateView.as_view(template_name='index.html'), name='dashboard'),
    path('inventory/', TemplateView.as_view(template_name='index.html'), name='inventory'),
    path('reports/', TemplateView.as_view(template_name='index.html'), name='reports'),
    path('alerts/', TemplateView.as_view(template_name='index.html'), name='alerts'),
    
    # Admin and API
    path('api/', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/accounts/', include('accounts.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/reports/', include('reports.urls')),
]

# Serve media and static files in development
if settings.DEBUG:
    from django.urls import re_path
    from django.views.static import serve
    import os
    static_root = os.path.join(settings.BASE_DIR, 'static')
    media_root = str(settings.MEDIA_ROOT)
    urlpatterns += [
        re_path(r'^static/(?P<path>.*)$', serve, {'document_root': static_root}),
        re_path(r'^media/(?P<path>.*)$', serve, {'document_root': media_root}),
    ]


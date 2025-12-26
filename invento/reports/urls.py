"""
Reports API URL Configuration
Uses DRF Router for ViewSet-based routing.

Endpoints:
    GET /api/reports/           - List available report endpoints
    GET /api/reports/download/  - Download CSV or Excel report
    GET /api/reports/summary/   - Get report summary statistics
"""
from rest_framework.routers import DefaultRouter
from .views import ReportsViewSet

# Create router and register viewset
router = DefaultRouter()
router.register(r'', ReportsViewSet, basename='reports')

# Use router URLs
urlpatterns = router.urls
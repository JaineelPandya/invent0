"""
Inventory API URL Configuration
Provides CRUD endpoints for inventory management.
"""
from rest_framework.routers import DefaultRouter
from .views import InventoryViewSet

router = DefaultRouter()
router.register(r'', InventoryViewSet, basename='inventory')

urlpatterns = router.urls

import logging
from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Inventory
from .serializers import InventorySerializer
from .pagination import InventoryPagination
from accounts.permissions import IsAdminOrReadOnly

logger = logging.getLogger(__name__)


class InventoryViewSet(ModelViewSet):
    """
    ViewSet for Inventory CRUD operations.
    Provides list, create, retrieve, update, destroy actions.
    
    Permissions:
    - Admin users: Full CRUD access
    - Viewer users: Read-only access (list/retrieve)
    
    All validation errors return 400 Bad Request with detailed messages.
    """
    queryset = Inventory.objects.all().order_by('-created_at')
    serializer_class = InventorySerializer
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    pagination_class = InventoryPagination
    filter_backends = [SearchFilter]
    search_fields = ['name', 'sku', 'supplier']
    
    def create(self, request, *args, **kwargs):
        """
        Create a new inventory item.
        Returns 201 on success, 400 on validation error.
        """
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            headers = self.get_success_headers(serializer.data)
            logger.info(f"Created inventory item: {serializer.data.get('sku')}")
            
            return Response(
                serializer.data, 
                status=status.HTTP_201_CREATED, 
                headers=headers
            )
        except Exception as e:
            # Log the error for debugging
            logger.error(f"Error creating inventory item: {e}")
            
            # If it's a validation error, it's already been handled
            # by raise_exception=True returning a 400
            raise
    
    def update(self, request, *args, **kwargs):
        """
        Update an existing inventory item.
        Returns 200 on success, 400 on validation error, 404 if not found.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        try:
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            
            logger.info(f"Updated inventory item: {serializer.data.get('sku')}")
            
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error updating inventory item {instance.sku}: {e}")
            raise
    
    def destroy(self, request, *args, **kwargs):
        """
        Delete an inventory item.
        Returns 204 on success, 404 if not found.
        """
        instance = self.get_object()
        sku = instance.sku
        
        try:
            self.perform_destroy(instance)
            logger.info(f"Deleted inventory item: {sku}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            logger.error(f"Error deleting inventory item {sku}: {e}")
            raise
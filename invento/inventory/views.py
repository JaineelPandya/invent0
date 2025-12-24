'''from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Inventory
from .serializers import InventorySerializer
from .pagination import InventoryPagination
from accounts.permissions import IsAdminOrReadOnly

class InventoryViewSet(ModelViewSet):
    queryset = Inventory.objects.all().order_by('-created_at')
    serializer_class = InventorySerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = InventoryPagination

    filter_backends = [SearchFilter]
    search_fields = ['name', 'sku', 'supplier']'''

from rest_framework.viewsets import ModelViewSet
from rest_framework.filters import SearchFilter

from .models import Inventory
from .serializers import InventorySerializer
from .pagination import InventoryPagination
from accounts.permissions import IsAdminOrReadOnly

class InventoryViewSet(ModelViewSet):
    queryset = Inventory.objects.all().order_by('-created_at')
    serializer_class = InventorySerializer
    permission_classes = [IsAdminOrReadOnly]

    # ✅ Pagination
    pagination_class = InventoryPagination

    # ✅ Search
    filter_backends = [SearchFilter]
    search_fields = ['name', 'sku', 'supplier']
    
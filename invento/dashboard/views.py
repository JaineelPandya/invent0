from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F
from django.utils.timezone import now

from inventory.models import Inventory

class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_items = Inventory.objects.count()

        total_stock_value = Inventory.objects.aggregate(
            total=Sum(F('quantity') * F('price'))
        )['total'] or 0

        low_stock_count = Inventory.objects.filter(
            quantity__lt=F('low_stock_threshold')
        ).count()

        expired_items_count = Inventory.objects.filter(
            expiration_date__lt=now().date()
        ).count()

        return Response({
            "total_items": total_items,
            "total_stock_value": total_stock_value,
            "low_stock_count": low_stock_count,
            "expired_items_count": expired_items_count
        })
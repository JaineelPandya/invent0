from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, F, Count
from django.utils.timezone import now
from datetime import timedelta

from inventory.models import Inventory

class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        total_items = Inventory.objects.count()

        total_stock_value = Inventory.objects.aggregate(
            total=Sum(F('quantity') * F('unit_price'))
        )['total'] or 0

        low_stock_items = Inventory.objects.filter(
            quantity__lte=F('reorder_level')
        ).count()

        expired_items = Inventory.objects.filter(
            expiry_date__lt=now().date()
        ).count()

        # Stock trend for last 7 days - shows total stock quantity per day
        stock_trend = []
        today = now().date()
        for i in range(6, -1, -1):
            date = today - timedelta(days=i)
            # Sum of quantities for items that existed by that date
            items_by_date = Inventory.objects.filter(created_at__date__lte=date)
            total_qty = items_by_date.aggregate(total=Sum('quantity'))['total'] or 0
            stock_trend.append({
                'date': date.isoformat(),
                'day': date.strftime('%a'),  # Short day name (Mon, Tue, etc.)
                'total_items': items_by_date.count(),
                'total_quantity': total_qty
            })

        # Category distribution
        category_distribution = list(
            Inventory.objects.values('category')
            .annotate(count=Count('id'))
            .order_by('-count')[:6]
        )
        # Rename 'category' to 'category_name' for frontend
        for item in category_distribution:
            item['category_name'] = item.pop('category') or 'Uncategorized'

        return Response({
            "total_items": total_items,
            "total_stock_value": float(total_stock_value),
            "low_stock_items": low_stock_items,
            "expired_items": expired_items,
            "stock_trend": stock_trend,
            "category_distribution": category_distribution
        })
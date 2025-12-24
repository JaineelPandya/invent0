import pandas as pd
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from inventory.models import Inventory

class InventoryCSVReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Inventory.objects.all().values(
            'name',
            'sku',
            'quantity',
            'price',
            'supplier',
            'expiration_date'
        )

        df = pd.DataFrame(list(queryset))

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="inventory_report.csv"'

        df.to_csv(response, index=False)

        return response

class InventoryExcelReportAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Inventory.objects.all().values(
            'name',
            'sku',
            'quantity',
            'price',
            'supplier',
            'expiration_date'
        )

        df = pd.DataFrame(list(queryset))

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="inventory_report.xlsx"'

        df.to_excel(response, index=False, engine='openpyxl')

        return response


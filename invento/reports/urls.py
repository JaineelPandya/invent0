from django.urls import path
from .views import InventoryCSVReportAPIView, InventoryExcelReportAPIView

urlpatterns = [
    path('inventory/csv/', InventoryCSVReportAPIView.as_view()),
    path('inventory/xlsx/', InventoryExcelReportAPIView.as_view()),
]
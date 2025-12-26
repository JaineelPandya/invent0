from django.urls import path
from .views import DashboardStatsAPIView

app_name = 'dashboard'

urlpatterns = [
    path('', DashboardStatsAPIView.as_view(), name='dashboard-root'),
    path('stats/', DashboardStatsAPIView.as_view(), name='dashboard-stats'),
]

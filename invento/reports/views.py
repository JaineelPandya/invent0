"""
Reports Views - Inventory Report Generation
Provides CSV and Excel export functionality for inventory data.
"""
import pandas as pd
from django.http import HttpResponse
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import F
from django.utils.timezone import now

from inventory.models import Inventory


class ReportsViewSet(viewsets.ViewSet):
    """
    ViewSet for generating inventory reports.
    
    Endpoints:
        GET /api/reports/download/ - Download inventory report (CSV or XLSX)
        GET /api/reports/summary/ - Get report summary statistics
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """
        GET /api/reports/
        Returns available report endpoints and summary.
        """
        return Response({
            'endpoints': {
                'download': '/api/reports/download/?format=csv|xlsx&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD',
                'summary': '/api/reports/summary/',
            },
            'available_formats': ['csv', 'xlsx'],
            'filters': ['start_date', 'end_date', 'status']
        })

    def _get_filtered_queryset(self, request):
        """
        Apply filters to inventory queryset based on request parameters.
        
        Query Parameters:
            start_date: Filter items created on or after this date
            end_date: Filter items created on or before this date
            status: Filter by stock status (in_stock, low_stock, expired)
        """
        queryset = Inventory.objects.all()
        
        # Date filters
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        status_filter = request.query_params.get('status')
        
        if start_date:
            queryset = queryset.filter(created_at__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__date__lte=end_date)
        
        # Status filter
        if status_filter == 'low_stock':
            queryset = queryset.filter(quantity__lte=F('reorder_level'))
        elif status_filter == 'expired':
            queryset = queryset.filter(expiry_date__lt=now().date())
        elif status_filter == 'in_stock':
            queryset = queryset.filter(quantity__gt=F('reorder_level'))
        
        return queryset

    @action(detail=False, methods=['get'], url_path='download', url_name='download')
    def download(self, request):
        """
        GET /api/reports/download/
        
        Download inventory report as CSV or Excel file.
        
        Query Parameters:
            file_format: 'csv' or 'xlsx' (default: csv)
            start_date: Filter start date (YYYY-MM-DD)
            end_date: Filter end date (YYYY-MM-DD)
            status: Filter by status (in_stock, low_stock, expired)
        
        Returns:
            File attachment (CSV or XLSX)
        
        Example:
            GET /api/reports/download/?file_format=csv&start_date=2025-01-01&end_date=2025-12-31
        """
        # Use 'file_format' instead of 'format' to avoid DRF's content negotiation conflict
        format_type = request.query_params.get('file_format', 'csv').lower()
        
        # Validate format
        if format_type not in ['csv', 'xlsx']:
            return Response(
                {'error': f'Invalid format: {format_type}. Use csv or xlsx.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get filtered queryset
        queryset = self._get_filtered_queryset(request)
        
        # Extract data for report
        data = queryset.values(
            'name',
            'sku',
            'category',
            'quantity',
            'unit_price',
            'supplier',
            'reorder_level',
            'expiry_date',
            'created_at'
        )
        
        # Create DataFrame
        df = pd.DataFrame(list(data))
        
        # Rename columns for better readability
        if not df.empty:
            df.columns = [
                'Name', 'SKU', 'Category', 'Quantity', 'Unit Price',
                'Supplier', 'Reorder Level', 'Expiry Date', 'Created At'
            ]
        
        # Generate filename with timestamp
        timestamp = now().strftime('%Y%m%d_%H%M%S')
        
        if format_type == 'xlsx':
            # Excel export - use BytesIO buffer for xlsx
            try:
                from io import BytesIO
                
                # Convert timezone-aware datetimes to timezone-naive for Excel compatibility
                for col in df.columns:
                    if df[col].dtype == 'datetime64[ns, UTC]' or (hasattr(df[col].dtype, 'tz') and df[col].dtype.tz is not None):
                        df[col] = df[col].dt.tz_localize(None)
                
                buffer = BytesIO()
                df.to_excel(buffer, index=False, engine='openpyxl')
                buffer.seek(0)
                
                response = HttpResponse(
                    buffer.getvalue(),
                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                )
                response['Content-Disposition'] = f'attachment; filename="inventory_report_{timestamp}.xlsx"'
            except Exception as e:
                import traceback
                print(f"XLSX Error: {e}")
                traceback.print_exc()
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # CSV export (default)
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="inventory_report_{timestamp}.csv"'
            df.to_csv(response, index=False)
        
        return response

    @action(detail=False, methods=['get'], url_path='summary', url_name='summary')
    def summary(self, request):
        """
        GET /api/reports/summary/
        
        Get summary statistics for inventory report.
        """
        queryset = self._get_filtered_queryset(request)
        
        total_items = queryset.count()
        total_value = sum(item.quantity * item.unit_price for item in queryset)
        low_stock_count = queryset.filter(quantity__lte=F('reorder_level')).count()
        expired_count = queryset.filter(expiry_date__lt=now().date()).count()
        
        return Response({
            'total_items': total_items,
            'total_value': float(total_value),
            'low_stock_count': low_stock_count,
            'expired_count': expired_count,
            'filters_applied': {
                'start_date': request.query_params.get('start_date'),
                'end_date': request.query_params.get('end_date'),
                'status': request.query_params.get('status'),
            }
        })

from django.contrib import admin

from .models import Inventory

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'quantity', 'unit_price', 'category', 'supplier', 'expiry_date')
    search_fields = ('name', 'sku', 'category', 'supplier')
    list_filter = ('category',)


from django.contrib import admin

from .models import Inventory

@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'quantity', 'price', 'supplier')
    search_fields = ('name', 'sku', 'supplier')

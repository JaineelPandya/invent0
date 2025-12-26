from rest_framework import serializers
from django.utils import timezone
from decimal import Decimal, InvalidOperation
from .models import Inventory


class InventorySerializer(serializers.ModelSerializer):
    """
    Serializer for Inventory model with auto-computed status field
    and robust validation for production use.
    """
    # Allow frontend to send category_name/supplier_name as aliases
    category_name = serializers.CharField(
        source='category', 
        required=False, 
        allow_null=True, 
        allow_blank=True
    )
    supplier_name = serializers.CharField(
        source='supplier', 
        required=False, 
        allow_null=True, 
        allow_blank=True
    )
    
    # Price alias for unit_price (frontend compatibility)
    price = serializers.DecimalField(
        source='unit_price',
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )
    
    # Explicit date field with multiple input formats for flexibility
    expiry_date = serializers.DateField(
        required=False, 
        allow_null=True,
        input_formats=['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', 'iso-8601'],
        format='%Y-%m-%d'  # Output format for consistent response
    )
    
    # Auto-computed status field (read-only)
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Inventory
        fields = [
            'id', 'name', 'sku', 'category', 'category_name', 'quantity', 
            'unit_price', 'price', 'supplier', 'supplier_name', 'reorder_level', 
            'expiry_date', 'description', 'created_at', 'updated_at', 'status'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'status']
        extra_kwargs = {
            'category': {'required': False, 'allow_null': True, 'allow_blank': True},
            'supplier': {'required': False, 'allow_null': True, 'allow_blank': True},
            'description': {'required': False, 'allow_null': True, 'allow_blank': True},
            'reorder_level': {'required': False, 'default': 10},
        }
    
    def get_status(self, obj):
        """
        Compute status based on expiry date and stock level.
        Priority: Expired > Low Stock > In Stock
        """
        if obj.expiry_date and obj.expiry_date < timezone.now().date():
            return 'Expired'
        if obj.quantity <= obj.reorder_level:
            return 'Low Stock'
        return 'In Stock'
    
    def to_internal_value(self, data):
        """
        Handle field aliases and data preprocessing before validation.
        """
        # Make a mutable copy
        data = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # Handle category_name -> category mapping
        if 'category_name' in data and 'category' not in data:
            data['category'] = data.get('category_name')
        
        # Handle supplier_name -> supplier mapping
        if 'supplier_name' in data and 'supplier' not in data:
            data['supplier'] = data.get('supplier_name')
        
        # Handle price -> unit_price mapping
        if 'price' in data and 'unit_price' not in data:
            data['unit_price'] = data.get('price')
        
        return super().to_internal_value(data)
    
    def validate_unit_price(self, value):
        """
        Validate unit_price to prevent DecimalField overflow.
        Max: 99,999,999.99 (10 digits, 2 decimal places)
        """
        if value is None:
            raise serializers.ValidationError("Unit price is required.")
        
        try:
            decimal_value = Decimal(str(value))
        except (InvalidOperation, ValueError, TypeError):
            raise serializers.ValidationError("Invalid price format.")
        
        if decimal_value < 0:
            raise serializers.ValidationError("Price cannot be negative.")
        
        if decimal_value >= Decimal('100000000'):  # 10^8
            raise serializers.ValidationError(
                "Price exceeds maximum allowed value (99,999,999.99)."
            )
        
        return value
    
    def validate_quantity(self, value):
        """
        Validate quantity is a non-negative integer.
        """
        if value is None:
            raise serializers.ValidationError("Quantity is required.")
        
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        
        return value
    
    def validate_sku(self, value):
        """
        Validate SKU is provided and unique.
        """
        if not value or not value.strip():
            raise serializers.ValidationError("SKU is required.")
        
        # Check for duplicate SKU (excluding current instance on update)
        instance = getattr(self, 'instance', None)
        queryset = Inventory.objects.filter(sku=value.strip())
        
        if instance:
            queryset = queryset.exclude(pk=instance.pk)
        
        if queryset.exists():
            raise serializers.ValidationError(
                f"Inventory item with SKU '{value}' already exists."
            )
        
        return value.strip()
    
    def validate_name(self, value):
        """
        Validate name is provided.
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Item name is required.")
        return value.strip()
    
    def validate_expiry_date(self, value):
        """
        Validate expiry_date format (already handled by DateField, 
        but we add helpful message for invalid formats).
        """
        return value
    
    def validate(self, attrs):
        """
        Object-level validation.
        """
        # Ensure reorder_level has a default if not provided
        if 'reorder_level' not in attrs or attrs.get('reorder_level') is None:
            attrs['reorder_level'] = 10
        
        return attrs

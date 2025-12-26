from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from .models import Inventory
from accounts.models import User

@receiver(post_save, sender=Inventory)
def low_stock_alert(sender, instance, **kwargs):
    """
    Send email alert to admins when inventory item falls below reorder level.
    Uses fail_silently=True and try/except to prevent email failures from crashing saves.
    """
    try:
        if instance.quantity <= instance.reorder_level:
            admins = User.objects.filter(role='admin').values_list('email', flat=True)

            if admins:
                send_mail(
                    subject='⚠️ Low Stock Alert',
                    message=f'''
Item: {instance.name}
SKU: {instance.sku}
Quantity left: {instance.quantity}
Reorder Level: {instance.reorder_level}
                    ''',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=list(admins),
                    fail_silently=True  # Don't crash on email failure
                )
    except Exception as e:
        # Log the error but don't crash the save operation
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send low stock alert for {instance.sku}: {e}")

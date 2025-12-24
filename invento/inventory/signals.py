from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

from .models import Inventory
from accounts.models import User

@receiver(post_save, sender=Inventory)
def low_stock_alert(sender, instance, **kwargs):
    if instance.quantity < instance.low_stock_threshold:
        admins = User.objects.filter(role='admin').values_list('email', flat=True)

        if admins:
            send_mail(
                subject='⚠️ Low Stock Alert',
                message=f'''
Item: {instance.name}
SKU: {instance.sku}
Quantity left: {instance.quantity}
Threshold: {instance.low_stock_threshold}
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=list(admins),
                fail_silently=False
            )

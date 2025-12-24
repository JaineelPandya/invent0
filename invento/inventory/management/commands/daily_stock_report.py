"""
Daily Stock Report Management Command
Sends a summary email to all admin users with total items and low-stock alerts.
Run manually: python manage.py daily_stock_report
"""
from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import F

from inventory.models import Inventory
from accounts.models import User


class Command(BaseCommand):
    help = 'Send daily stock report email to all admin users'

    def handle(self, *args, **kwargs):
        # Get inventory statistics
        total_items = Inventory.objects.count()
        low_stock_items = Inventory.objects.filter(quantity__lt=F('low_stock_threshold'))
        total_low_stock = low_stock_items.count()

        # Build email message
        message = f"""
📊 DAILY INVENTORY REPORT
========================

Total Items in Inventory: {total_items}
Low Stock Items: {total_low_stock}

"""
        if low_stock_items.exists():
            message += "⚠️ LOW STOCK ITEMS:\n"
            message += "-" * 40 + "\n"
            for item in low_stock_items:
                message += f"• {item.name} (SKU: {item.sku})\n"
                message += f"  Quantity: {item.quantity} | Threshold: {item.low_stock_threshold}\n\n"
        else:
            message += "✅ All items are sufficiently stocked!"

        # Get admin emails
        admins = User.objects.filter(role='admin').values_list('email', flat=True)

        if admins:
            send_mail(
                subject='📊 Daily Inventory Report',
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=list(admins),
                fail_silently=False
            )
            self.stdout.write(self.style.SUCCESS(f'Report sent to {len(admins)} admin(s)'))
        else:
            self.stdout.write(self.style.WARNING('No admin users found'))

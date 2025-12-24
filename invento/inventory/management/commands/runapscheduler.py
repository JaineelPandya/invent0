"""
Start the APScheduler background scheduler for periodic tasks.
Run: python manage.py runapscheduler
"""
from django.core.management.base import BaseCommand
from django.conf import settings

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from django_apscheduler.jobstores import DjangoJobStore
from django_apscheduler.models import DjangoJobExecution
from django_apscheduler import util

from django.core.mail import send_mail
from django.db.models import F
from inventory.models import Inventory
from accounts.models import User

import logging

logger = logging.getLogger(__name__)


def send_daily_report():
    """Send daily inventory report at 9 AM"""
    total_items = Inventory.objects.count()
    low_stock_items = Inventory.objects.filter(quantity__lt=F('low_stock_threshold'))
    total_low_stock = low_stock_items.count()

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

    admins = User.objects.filter(role='admin').values_list('email', flat=True)

    if admins:
        send_mail(
            subject='📊 Daily Inventory Report',
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=list(admins),
            fail_silently=False
        )
        logger.info(f'Daily report sent to {len(admins)} admin(s)')


@util.close_old_connections
def delete_old_job_executions(max_age=604_800):
    """Delete job execution logs older than max_age seconds (default 7 days)"""
    DjangoJobExecution.objects.delete_old_job_executions(max_age)


class Command(BaseCommand):
    help = 'Runs APScheduler for scheduled tasks'

    def handle(self, *args, **options):
        scheduler = BackgroundScheduler(timezone=settings.TIME_ZONE)
        scheduler.add_jobstore(DjangoJobStore(), "default")

        # Schedule daily report at 9:00 AM
        scheduler.add_job(
            send_daily_report,
            trigger=CronTrigger(hour=9, minute=0),  # 9:00 AM every day
            id="daily_stock_report",
            max_instances=1,
            replace_existing=True,
        )
        logger.info("Added job: Daily Stock Report @ 9:00 AM")

        # Cleanup old job executions weekly
        scheduler.add_job(
            delete_old_job_executions,
            trigger=CronTrigger(day_of_week="mon", hour=0, minute=0),
            id="delete_old_job_executions",
            max_instances=1,
            replace_existing=True,
        )
        logger.info("Added job: Delete old job executions")

        try:
            self.stdout.write(self.style.SUCCESS("Starting scheduler..."))
            self.stdout.write("Press Ctrl+C to exit")
            scheduler.start()
            
            # Keep the main thread alive
            import time
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING("Stopping scheduler..."))
            scheduler.shutdown()
            self.stdout.write(self.style.SUCCESS("Scheduler stopped successfully!"))

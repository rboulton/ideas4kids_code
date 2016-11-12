from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = """Ensure materialized views are up to date.

    Run this regularly.  It will do minimal work if no changes have been made.

    """
    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("select * from update_activities_search()")

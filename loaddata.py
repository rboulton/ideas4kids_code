#!/usr/bin/env python

from django.conf import settings
from django.core import management
import django
import os
import sys

if __name__ == "__main__":
    print 'Type "yes" to replace database contents with archive contents'
    val = sys.stdin.readline().strip().lower()
    if val == 'yes':
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ideas4kids.settings")
        django.setup()
        management.call_command('migrate')
        management.call_command('loaddata', 'activities.json', verbosity=0)

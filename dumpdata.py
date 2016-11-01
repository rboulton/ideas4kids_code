#!/usr/bin/env python

from django.conf import settings
from django.core import management
import django
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "ideas4kids.settings")
    django.setup()
    thisdir = os.path.dirname(os.path.abspath(__file__))
    output = os.path.join(thisdir, 'ideas4kids', 'activities', 'fixtures', 'activities.json')
    save_stdout = sys.stdout
    sys.stdout = open(output, 'wb')
    a = management.call_command('dumpdata', 'activities', indent=4, format='json')
    sys.stdout = save_stdout


from django.contrib.sitemaps import Sitemap
from ideas4kids.activities.models import Activity, Tag

class ActivitiesSitemap(Sitemap):
    def items(self):
        return Activity.objects.all()

class TagSitemap(Sitemap):
    def items(self):
        return Tag.objects.filter(type='c')

from django.conf.urls import url, include
from django.contrib import admin
from django.views.static import serve
import django.contrib.sitemaps.views
import os
from ideas4kids import activities
from ideas4kids.activities import sitemap
from ideas4kids import settings

admin.autodiscover()

# FIXME
sitemaps = {
     'activities': activities.sitemap.ActivitiesSitemap,
     'tags': activities.sitemap.TagSitemap,
}

urlpatterns = [
    # Views of the activities
    url('', include('ideas4kids.activities.urls')),
    url('', include('fuse.urls')),

    # Robots.txt
    url(r'^(?P<path>robots.txt)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'robots'),
        'show_indexes': False,
    }),

    # Google verification.
    url(r'^(?P<path>googlee883a534410f2854.html)', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'robots'),
        'show_indexes': False,
    }),

    # Uploaded media
    url(r'^media/(?P<path>.*)$', serve, {
        'document_root': settings.MEDIA_ROOT,
        'show_indexes': True,
    }),

    # Admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Admin interface
    url(r'^admin/', include(admin.site.urls)),

    # Sitemap
    url(r'^sitemap\.xml$', django.contrib.sitemaps.views.sitemap,
        {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),

]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ]

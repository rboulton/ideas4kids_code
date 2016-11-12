from django.conf.urls import url, include
from django.contrib import admin
from django.views.static import serve
import os
import settings
from ideas4kids import activities

admin.autodiscover()

# FIXME
# sitemaps = {
#     'activities': activities.sitemap.ActivitiesSitemap,
#     'tags': activities.sitemap.TagSitemap,
# }

urlpatterns = [
    # Views of the activities
    url('', include('ideas4kids.activities.urls')),
    url('', include('fuse.urls')),

    # Static media
    url(r'^static/(?P<path>.*)$', serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'static'),
        'show_indexes': True,
    }),

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
        'document_root': os.path.join(settings.BASE_DIR, 'data', 'uploads'),
        'show_indexes': True,
    }),

    # Admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Admin interface
    url(r'^admin/', include(admin.site.urls)),

#     # Sitemap
#     (r'^sitemap.xml$', 'django.contrib.sitemaps.views.sitemap',
#      {'sitemaps': sitemaps})

]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        url(r'^__debug__/', include(debug_toolbar.urls)),
    ]

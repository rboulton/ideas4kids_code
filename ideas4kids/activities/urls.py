from django.urls import re_path
from . import views

urlpatterns = [
    re_path('^$', views.frontpage),
    re_path('^(?P<idnum>[0-9]+)$', views.activityredir),
    re_path('^activity/(?P<urlname>[a-zA-Z0-9_ +\'-]+)$', views.activity),
    re_path('^activity/(?P<urlname>[a-zA-Z0-9_ +\'-]+)/edit/tags$', views.activity_tags),
    re_path('^activity/(?P<urlname>[a-zA-Z0-9_ +\'-]+)/edit/form$', views.activity_form),
    re_path('^activities/(?P<tag>([a-zA-Z0-9_ +\'-]|%20)*)$', views.activities),
    re_path('^browse/(?P<tag>([a-zA-Z0-9_ +\'-]|%20)*)(?:/(?P<subtags>([a-zA-Z0-9_ +\'-]|%20)*))*$', views.browse),
    re_path('^info$', views.info),
    re_path('^sitemap/$', views.sitemap),
]

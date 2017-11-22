from django.conf.urls import url
from . import views

urlpatterns = [
    url('^$', views.frontpage),
    url('^(?P<idnum>[0-9]+)$', views.activityredir),
    url('^activity/(?P<urlname>[a-zA-Z0-9_ +\'-]+)$', views.activity),
    url('^activity/(?P<urlname>[a-zA-Z0-9_ +\'-]+)/edit/tags$', views.activity_tags),
    url('^activity/(?P<urlname>[a-zA-Z0-9_ +\'-]+)/edit/form$', views.activity_form),
    url('^activities/(?P<tag>([a-zA-Z0-9_ +\'-]|%20)*)$', views.activities),
    url('^browse/(?P<tag>([a-zA-Z0-9_ +\'-]|%20)*)(?:/(?P<subtags>([a-zA-Z0-9_ +\'-]|%20)*))*$', views.browse),
    url('^info$', views.info),
    url('^sitemap/$', views.sitemap),
]

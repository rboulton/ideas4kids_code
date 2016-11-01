from django.conf.urls import url
import django.views.static
import os
from ideas4kids import settings
import views

urlpatterns = [
    url('^tools/fuse/$', views.choose_board,),
    url('^tools/fuse/board$', views.board,),

    url(r'^tools/fuse/static/(?P<path>.*)$', django.views.static.serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'fuse', 'static'),
        'show_indexes': True,
    }),
]

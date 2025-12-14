from django.urls import re_path
import django.views.static
import os
from ideas4kids import settings
from . import views

urlpatterns = [
    re_path('^tools/fuse/$', views.choose_board,),
    re_path('^tools/fuse/board$', views.board,),

    re_path(r'^tools/fuse/static/(?P<path>.*)$', django.views.static.serve, {
        'document_root': os.path.join(settings.BASE_DIR, 'fuse', 'static'),
        'show_indexes': True,
    }),
]

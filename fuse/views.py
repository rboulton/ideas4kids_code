from ideas4kids.shortcuts import render
from django.shortcuts import get_object_or_404
import models

def choose_board(request):
    return (render(request, 'fuse/choose.html', {'layouts': models.layouts}))

def board(request):
    return (render(request, 'fuse/board.html', {}))

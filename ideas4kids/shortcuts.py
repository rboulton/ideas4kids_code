import django.shortcuts


def render(request, template_name, context=None, base=None):
    if context is None:
        context = {}
    if base is None:
        base = 'base.html'
    context['base'] = base
    context['path'] = request.path
    return django.shortcuts.render(request, template_name, context)

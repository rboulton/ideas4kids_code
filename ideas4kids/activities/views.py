from ideas4kids.activities.models import Activity, Image, Tag
from ideas4kids.shortcuts import render
from django.shortcuts import get_object_or_404
from django.http import HttpResponse, HttpResponsePermanentRedirect
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

import itertools
import json
import random
import re

def frontpage(request):
    """View for frontpage.

    """
    activities = Activity.objects.all().order_by('-update_time')[:5]

    slideimgs = []
    images = Image.objects.all().filter(slideshow='y').order_by('?')
    for image in images:
        img_activities = Activity.objects.filter(images=image).order_by('-update_time')[:1]
        if len(img_activities) != 1:
            continue
        slideimgs.append({
                         'width': image.name.width,
                         'height': image.name.height,
                         'href': img_activities[0].get_absolute_url(),
                         'url': image.get_absolute_url(),
                         'alt': img_activities[0].title,
        })
        if len(slideimgs) >= 20:
            break
    slideimgs.sort(key=lambda x: -x['width'])
    if len(slideimgs) > 5:
        pos = random.choice(range(len(slideimgs) - 6))
        slideimgs = slideimgs[pos:pos+6]

    if len(slideimgs) > 0:
        slideimg_width = max(slideimg['width'] for slideimg in slideimgs)
        slideimg_height = max(slideimg['height'] for slideimg in slideimgs)
    else:
        slideimg_width = 0
        slideimg_height = 0

    return (render(request, 'frontpage.html', {
                'slideimg_width': slideimg_width,
                'slideimg_height': slideimg_height,
                'slideimgs': slideimgs,
                'activities': activities,
                'edit': request.user.is_staff,
            }))

def activityredir(request, idnum):
    """View for a numerical reference to an activity.

    """
    activity_obj = get_object_or_404(Activity, pk=idnum)
    return HttpResponsePermanentRedirect(activity_obj.get_absolute_url())

def activity(request, urlname):
    """View for an individual activity page.

    """
    activity_obj = get_object_or_404(Activity, urlname=urlname)
    return (render(request, 'activity.html', {
                            'activity': activity_obj,
                            'edit': request.user.is_staff,
            }))

def activity_tags(request, urlname):
    """Return the tags for a particular activity.

    """
    activity_obj = get_object_or_404(Activity, urlname=urlname)
    tags = [(tag.text, tag.count()) for tag in activity_obj.tags]
    tagset = set(tag[0] for tag in tags)

    alltags = []
    for tag in Tag.objects.all().order_by('text'):
        if tag.text in tagset: continue
        alltags.append((tag.text, tag.count()))

    tags.sort(key=lambda item: item.text.lower())
    alltags.sort(key=lambda item: item.text.lower())

    return HttpResponse(json.dumps([tags, alltags]),
                        mimetype='application/json')

def activity_form(request, urlname):
    """Return the form for a particular activity.

    """
    activity = get_object_or_404(Activity, urlname=urlname)

    tagset = set(tag.text for tag in activity.tags.all())
    othertags = []
    for tag in Tag.objects.all().order_by('text'):
        if tag.text in tagset: continue
        othertags.append(tag)

    othertags.sort(key=lambda item: item.text.lower())

    activity.othertags = othertags
    return (render(request, 'activityform.html', {
                'activity': activity,
            }))

def activities_matching_tag(tagtext, source):
    try:
        tag_obj = Tag.objects.get(text=tagtext)
    except Tag.DoesNotExist:
        return None, ()

    source_obj = None
    if source is not None:
        try:
            source_obj = Tag.objects.get(text=source)
        except Tag.DoesNotExist:
            pass

    if source_obj is None:
        return tag_obj, Activity.objects.\
            filter(tags=tag_obj).\
            distinct().\
            order_by('-update_time')

    activities = Activity.objects.\
        filter(tags=tag_obj).\
        exclude(tags=source_obj).\
        distinct().\
        order_by('-update_time')
    source_activities = Activity.objects.\
        filter(tags=tag_obj).\
        filter(tags=source_obj).\
        distinct().\
        order_by('-update_time')
    return tag_obj, tuple(itertools.chain(activities, source_activities))

def activities_matching_search(query_string):
    rank_formula = '''
      ts_rank(
        s.tsv,
        plainto_tsquery(%s)
      ) +
      ts_rank(s.tsv,
        to_tsquery(%s)
      )
    '''

    match_formula = '''
      s.tsv @@ (plainto_tsquery(%s) || to_tsquery(%s))
    '''

    or_query_string = re.sub('[^a-zA-Z0-9]+', '|', query_string).strip('|')

    return list(Activity.objects.raw('''
        select
            a.*,
            {} as rank
        from
            activities_activity as a
        inner join
            activities_search as s ON (a.id = s.activity_id)
        where
            {}
        order by
            rank desc,
            a.update_time desc
    '''.format(
        rank_formula,
        match_formula,
    ), [
        query_string,
        or_query_string,
        query_string,
        or_query_string,
    ]))

def search_for_activities(urltext, query, source):
    if urltext != '':
        # Validation only allows urltext to contain %20 or +; everything else
        # is a normal character.
        urltext = urltext.replace('%20', ' ').replace('+', ' ')

    if query is not None:
        querystr = query.strip()
    else:
        querystr = ""

    if source is not None:
        source = source.strip()

    if query is None:
        tag_obj, activities = activities_matching_tag(urltext, source)
        if tag_obj is not None:
            return querystr, activities, tag_obj

    if query == '':
        activities = Activity.objects.all().order_by('-update_time')
    else:
        activities = activities_matching_search(query)
    return querystr, activities, None

def activities(request, tag):
    """Display a page with a list of activities.

    """
    query, activities, tag_obj = search_for_activities(tag,
        request.GET.get('query'),
        request.GET.get('source'))
    displayids = ','.join(map(str, sorted(activity.pk
                                          for activity in activities)))

    if query:
        items_per_page = 10
    else:
        items_per_page = 5

    paginator = Paginator(activities, items_per_page, orphans=3) 
    page = request.GET.get('page')
    try:
        activities_page = paginator.page(page)
    except PageNotAnInteger:
        activities_page = paginator.page(1)
    except EmptyPage:
        activities_page = paginator.page(paginator.num_pages)

    return (render(request, 'activities.html', {
                            'activities': activities_page,
                            'noactivities': len(activities) == 0,
                            'displayids': displayids,
                            'query': query,
                            'tag': tag_obj,
            }))

def sitemap(request):
    groups = []

    # Build an "others" section for all activities not tagged by a sitemap:
    # child tag.  This is trivial with a search engine, but hard to do with
    # SQL, so for now we'll just do it in python.
    others = dict(((activity.id, activity)
                   for activity in Activity.objects.all()))

    group_tag = Tag.objects.get(text='sitemap:')
    for tag in group_tag.children.all():
        activities = Activity.objects.all().filter(tags=tag).order_by('title')
        for activity in activities:
            try:
                del others[activity.id]
            except KeyError:
                # Activity is in more than one group.
                pass
        if len(activities) > 0:
            groups.append((str(tag), activities))

    if len(others) > 0:
        others = others.values()
        others.sort(key=lambda activity: activity.title)
        groups.append((u"Other", others))

    tag_obj = get_object_or_404(Tag, text='browse:themes')
    theme_groups = make_activity_tag_group(tag_obj)

    tag_obj = get_object_or_404(Tag, text='browse:techniques')
    technique_groups = make_activity_tag_group(tag_obj)

    return (render(request, 'sitemap.html', {
                'groups': groups,
                'theme_groups': theme_groups,
                'technique_groups': technique_groups,
            }))

def get_browse_tag_descendents(parent, tagids_seen=None):
    """Get activity tag descendents which should be browsed to.

    """
    if parent.browse_target():
        return []
    if tagids_seen is None:
        tagids_seen = set((parent.id,))
    subtags = []
    for tag in parent.children.all().order_by('order'):
        if tag.id in tagids_seen:
            continue
        tagids_seen.add(tag.id)

        if tag.browse_target():
            subtags.append((tag, None))
        else:
            subtags.extend(get_browse_tag_descendents(tag, tagids_seen))
    return subtags

def make_activity_tag_group(parent):
    groups = []
    for tag in parent.children.all():
        subtags = tuple(sorted(get_browse_tag_descendents(tag),
                               key=lambda x: (x[0].order, x[0].text)))
        groups.append((tag, subtags))
    return groups

def browse(request, tag, subtags=None):
    tag_obj = None
    if tag != '':
        # Validation only allows tag to contain %20 or +; everything else is a
        # normal character.
        tag = 'browse:' + tag.replace('%20', ' ').replace('+', ' ')
        tag_obj = get_object_or_404(Tag, text=tag)


    template = 'browse.html'
    params = {
        'groups': make_activity_tag_group(tag_obj),
    }
    if subtags:
        # Validation only allows tag to contain %20 or +; everything else is a
        # normal character.
        subtags = subtags.replace('%20', ' ').replace('+', ' ')
        subtags = filter(None, subtags.split('/'))
        breadcrumbs = [tag_obj]
        for subtag in subtags:
            subtag = 'browse:' + subtag
            subtag_obj = get_object_or_404(Tag, text=subtag)
            breadcrumbs.append(subtag_obj)

        params['breadcrumbs'] = breadcrumbs
        params['subtag_obj'] = subtag_obj
        params['subtags'] = tuple(sorted(get_browse_tag_descendents(subtag_obj),
                                         key=lambda x: (x[0].order, x[0].text)))
        params['tag'] = tag_obj

        if tag_obj.type == 'b':
            template = 'browse_with_buttons.html'
    else:
        if tag_obj.type == 'b':
            template = 'browse_with_buttons_top.html'

    return (render(request, template, params))

def info(request):
    return (render(request, 'info/index.html'))

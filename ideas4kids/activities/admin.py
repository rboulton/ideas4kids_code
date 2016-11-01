from ideas4kids.activities.models import Image, Tag, Pdf, Video, Activity, \
    TagSynonym
from django.contrib import admin

class ImageAdmin(admin.ModelAdmin):
    list_display = ('name', 'slideshow')

class ActivityAdmin(admin.ModelAdmin):
    filter_horizontal = ('tags', 'images', 'pdfs', 'videos')

class TagAdmin(admin.ModelAdmin):
    search_fields = ('text', 'displaytext',)
    filter_horizontal = ('children', 'synonyms')
    list_display = ('text', 'display_text', 'list_synonyms', 'type', 'count', 'children_names',
                    'parent_names', 'meta_description',)
    list_editable = ('type',)
    list_filter = ('type',)
    ordering = ('text',)
    save_on_top = True

admin.site.register(Tag, TagAdmin)
admin.site.register(Pdf)
admin.site.register(Video)
admin.site.register(Image, ImageAdmin)
admin.site.register(Activity, ActivityAdmin)
admin.site.register(TagSynonym)

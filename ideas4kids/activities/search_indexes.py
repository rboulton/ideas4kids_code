
from haystack import indexes
from haystack.sites import site
from activities.models import Activity

class ActivityIndex(indexes.SearchIndex):
    text = indexes.CharField(document=True)
    update_time = indexes.DateTimeField(model_attr='update_time')
    tags = indexes.MultiValueField()

    def prepare_text(self, obj):
        """Prepare data for searching.

        """
        return u' '.join((obj.title, obj.text, u' '.join(self.get_all_tags(obj))))

    def get_all_tags(self, obj):
        result = []
        for tag in obj.tags.all():
            result.append(unicode(tag))
            for synonym in tag.synonyms.all():
                result.append(unicode(synonym))
        return result

    def prepare_tags(self, obj):
        return ','.join(self.get_all_tags(obj))

site.register(Activity, ActivityIndex)

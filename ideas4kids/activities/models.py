from django.db import models
import datetime

class Image(models.Model):
    name = models.ImageField(upload_to='image/%Y/%m/%d')

    TYPE_CHOICES = (
        ('y', 'Include in slideshow'),
        ('n', "Don't include in slideshow"),
    )
    slideshow = models.CharField(max_length=1, choices=TYPE_CHOICES)

    def get_absolute_url(self):
        return '/media/' + self.name.name

    def __unicode__(self):
        return self.name.name

class TagSynonym(models.Model):
    text = models.CharField(max_length=100,
        help_text="The text for this synonym")

    def __unicode__(self):
        return self.text

class Tag(models.Model):
    order = models.IntegerField(blank=True, null=True,
        help_text="Number to control the order")

    text = models.CharField(unique=True, max_length=100,
        help_text="The unique text identifying this tag")

    displaytext = models.CharField(blank=True, max_length=100,
        help_text="A longer piece of text describing the tag.  Optional.")

    description = models.TextField(blank=True,
        help_text="Descriptive text for meta-content tag for searches "
        "for the tag")

    def meta_description(self):
        return self.description or \
            "Activities tagged as %s" % self.display()

    def display(self):
        return self.displaytext or self.text

    def browse_target(self):
        """Return true if this tag should be the target of browsing.

        """
        return self.type in ('a', 's')

    def display_in_activitybox(self):
        if self.count() <= 1:
            return False
        return self.type in ('a',)

    def use_for_search(self):
        return self.type in ('a', 's')

    icon = models.ImageField(upload_to='tagicon/%Y/%m/%d', blank=True,
        help_text="An icon for this tag.")

    icon_selected = models.ImageField(upload_to='tagicon/%Y/%m/%d', blank=True, null=True,
        help_text="An icon to use when this tag is selected.")

    TYPE_CHOICES = (
        ('a', 'Display,search,browse'),
        ('s', 'Search,browse'),
        ('c', "Navigation category"),
        ('b', "Navigate with buttons"),
    )
    type = models.CharField(max_length=1, choices=TYPE_CHOICES)

    children = models.ManyToManyField('Tag', blank=True, symmetrical=False,
        help_text="Subtags of this tag.")

    synonyms = models.ManyToManyField(TagSynonym, blank=True,
        help_text="Synonyms of this tag.")

    def __unicode__(self):
        return self.text

    def display_text(self):
        return self.displaytext or ""

    def get_absolute_url(self):
        if self.text.startswith("browse:"):
            text = self.text[7:]
            parent = self.parent_names().split(',')[0][7:]
            if parent:
                return '/browse/' + parent + '/' + text
            else:
                return '/browse/' + text
        return '/browse/' + self.text

    def count(self):
        return Activity.objects.filter(
            models.Q(tags=self)
        ).distinct().count()

    def children_names(self):
        return u', '.join(str(child) for child in self.children.all())

    def parent_names(self):
        parents = Tag.objects.all().filter(children__text=self.text)
        return u', '.join(str(parent) for parent in parents)

    def list_synonyms(self):
        return u', '.join(str(synonym) for synonym in self.synonyms.all())

    def get_search_url(self):
        return '/activities/' + self.text

    def matching_ids(self):
        activities = Activity.objects.filter(tags=self).distinct()
        return ','.join(map(str, sorted(activity.pk
                                        for activity in activities)))

    class Meta:
        ordering = ('order', 'text',)

class Pdf(models.Model):
    TYPE_CHOICES = (
        ('i', 'Instruction sheet'),
        ('t', 'Template'),
        ('o', 'Other'),
    )
    TYPE_ICONS = {
        'i': 'instruction icon 50.png',
        't': 'template icon.png',
        'o': 'instruction icon 50.png',
    }

    name = models.FileField(upload_to='pdf/%Y/%m/%d')
    type = models.CharField(max_length=1, choices=TYPE_CHOICES)
    description = models.TextField(blank=True, default="")

    def get_label(self):
        if self.description != '':
            return self.description
        return self.get_type_display()

    def get_absolute_url(self):
        return '/media/' + self.name.name

    def get_icon_path(self):
        return '/static/icon/' + self.TYPE_ICONS.get(self.type)

    def __unicode__(self):
        return self.name.name + " (" + self.get_type_display() + ")"

class Video(models.Model):
    TYPE_CHOICES = (
        ('d', 'demonstration'),
    )

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=100, choices=TYPE_CHOICES)
    image = models.ForeignKey(Image, blank=True)

    width = models.IntegerField(blank=True, null=True,
        help_text="Width of the video box")

    height = models.IntegerField(blank=True, null=True,
        help_text="Height of the video box")

    code = models.TextField(blank=True, null=True,
        help_text="Identifier code for the video")

    def __unicode__(self):
        return self.name

class Activity(models.Model):
    urlname = models.SlugField(
        max_length=255, null=False, blank=False, unique=True,
        help_text="The unique name to use in URLs to identify this activity.")

    title = models.CharField(
        max_length=200,
        help_text="The title of this activity.")

    text = models.TextField(
        help_text="Descriptive text about the activity")

    description = models.TextField(blank=True,
        help_text="Descriptive text for meta-content tag for searches "
        "for the tag")

    def meta_description(self):
        return self.description or self.text or \
            "An activity titled: %s" % self.title

    update_time = models.DateTimeField(
        default=datetime.datetime.now,
        help_text="The date &amp; time at which the activity last had a "
        "(significant) update")

    difficulty = models.FloatField(
        help_text="Difficulty, 0=very easy, 10=very hard")

    min_age = models.IntegerField(blank=True, null=True,
        help_text="Minimum age for which the activity is suitable")

    min_age_with_help = models.IntegerField(blank=True, null=True,
        help_text="Minimum age for which the activity is suitable given help")

    tags = models.ManyToManyField(Tag, blank=True,
        help_text="The tags associated with this activity.")

    def sortedtags(self):
        taglist = list(self.tags.all())
        taglist.sort(key=lambda item: item.text.lower())
        return taglist

    images = models.ManyToManyField(Image, blank=True,
        help_text="The images associated with this activity.")

    pdfs = models.ManyToManyField(Pdf, blank=True,
        help_text="The PDFs associated with this activity.")

    def get_links(self):
        res = []
        count = 0
        for pdf in self.pdfs.all():
            if count > 0 and count % 4 == 0:
                pdf.newline = True
            res.append(pdf)
            count += 1
        return res

    videos = models.ManyToManyField(Video, blank=True,
        help_text="The videos associated with this activity.")

    def get_absolute_url(self):
        return '/activity/' + self.urlname

    def __unicode__(self):
        return self.title

    class Meta:
        verbose_name_plural = 'Activities'
        ordering = ('title',)


# -*- coding: utf-8 -*

from django.db import models
from django.core.urlresolvers import reverse

class Original(models.Model):
    
    image = models.ImageField(upload_to='scythe-images/')

    @models.permalink
    def get_absolute_url(self):
        return "%s?id=%s" % (reverse('scythe_original_src'), self.id)

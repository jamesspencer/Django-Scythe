from django.conf.urls.defaults import *

urlpatterns = patterns('scythe.views',
    url(r'^admin/scythe/bounce/$', 'bounce_image', {}, name='scythe_get_imagedata'),
)
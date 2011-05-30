from django.conf.urls.defaults import *

urlpatterns = patterns('scythe.views',
    url(r'^original_src/$', 'original_src', {}, name='scythe_original_src'),
)
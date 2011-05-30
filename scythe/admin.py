# -*- coding: utf-8 -*

from django.contrib import admin

from scythe.models import Original


class OriginalAdmin(admin.ModelAdmin):
    list_display = ('id', 'image')

admin.site.register(Original, OriginalAdmin)

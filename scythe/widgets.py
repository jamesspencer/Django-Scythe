from django import forms
from django.utils.safestring import mark_safe

class AdminScytheWidget(forms.FileInput):
    """
    A ImageField Widget for admin that allows users to crop
    """

    class Media:
        css = {
            'all': ('django-scythe/django-scythe.css', 'django-scythe/jqModal.css', 'django-scythe/jquery.Jcrop.css')
        }
        js = ('django-scythe/unclobber-jquery.js', 'django-scythe/django-scythe.js', 'django-scythe/jqModal.js', 'django-scythe/jquery.Jcrop.js')

    def __init__(self, *args, **kwargs):
        self.dims = False
        self.min_dims = False
        self.max_dims = False
        if "attrs" in kwargs:
            attrs = kwargs.pop("attrs")
            if "dimensions" in attrs:
                self.dims = attrs.pop("dimensions")
            if "min_dimensions" in attrs:
                self.min_dims = attrs.pop("min_dimensions")
            if "max_dimensions" in attrs:
                self.max_dims = attrs.pop("max_dimensions")
        super(AdminScytheWidget, self).__init__(*args, **kwargs)

    def render(self, name, value, attrs=None):
        hidden_inputs = ''
        dims = False
        for x, y, z in ((self.dims, '', ''), (self.max_dims, 'At most ', 'max_'), (self.min_dims, 'At least ', 'min_')):
            if x:
                hidden_inputs += '<input type="hidden" name="%sdims" value="%s,%s" />' % (z, x.get('w', '0'), x.get('h', '0'))
                if not dims and x.get('w', False) and x.get('h', False):
                    dims = '%s%spx x %spx' % (y, x.get('w'), x.get('h'))
                elif not dims and x.get('w', False):
                    dims = '%s%spx wide' % (y, x.get('w'),)
                elif not dims and x.get('h', False):
                    dims = '%s%spx tall' % (y, x.get('h'),)
        for x in ('cw', 'ch', 'cx', 'cy', 'cx2', 'cy2'):
            hidden_inputs += '<input type="hidden" name="%s" />' % (x,)
        if value and hasattr(value, "url"):
            # we have an image - show it!
            output = """
            <div class="django-scythe previous-input">
              <div class="target">
                <span class="text"><span class="click">Click</span> <span class="or">or</span> <span class="drag">Drag</span> <span class="drop">Drop</span> <span class="dims">%s</span></span>
                %s
              </div>
              <div class="preview">
                  <div class="mini-crop"><a target="_blank" class="current" href="%s"><img src="%s" /></a></div>
                  <div class="django-scythe-actions"><a href="#" class="crop">crop</a> <a href="#" class="reset">clear</a> %s</div>
              </div>
            </div>
            """ % (dims, super(AdminScytheWidget, self).render(name, value, attrs), value.url, value.url, hidden_inputs)
        else:
            output = """
            <div class="django-scythe no-input">
              <div class="target">
                <span class="text"><span class="click">Click</span> <span class="or">or</span> <span class="drag">Drag</span> <span class="drop">Drop</span> <span class="dims">%s</span></span>
                %s
              </div>
              <div class="preview">
                  <div class="mini-crop"></div>
                  <div class="django-scythe-actions"><span><a href="#" class="crop">crop</a></span><span><a href="#" class="reset">clear</a></span>%s</div>
              </div>
            </div>
            """ % (dims, super(AdminScytheWidget, self).render(name, value, attrs), hidden_inputs)
        return mark_safe(output)

    def value_from_datadict(self, data, files, name):
        "File widgets take data from FILES, not POST"
        postedimg = files.get(name, None)
        if postedimg:
            from StringIO import StringIO
            from django.core.files.uploadedfile import InMemoryUploadedFile
            import Image
            import os
            import ImageFile
            ImageFile.MAXBLOCK = 1024 * 1024 # default is 64k - avoids 'Suspension not allowed here' error
            tmp_file = StringIO()
            if hasattr(postedimg, 'temporary_file_path'):
                field_name = None
                newimg = Image.open(postedimg.temporary_file_path())
            else:
                field_name = postedimg.field_name
                newimg = Image.open(StringIO(postedimg.read()))
            newimg = newimg.crop([int(data.get('cx', 0)),int(data.get('cy', 0)),int(data.get('cx2', 0)),int(data.get('cy2', 0))]).resize([self.dims.get('w', 100),self.dims.get('h', 100)],Image.ANTIALIAS)
            postedimg.seek(0)
            newimg_io = StringIO()
            newimg.save(newimg_io, format='JPEG', quality=90)
            newimg_io.seek(0)
            postedimg = InMemoryUploadedFile(newimg_io, field_name, postedimg.name, 'image/jpeg', newimg_io.len, None)
        return postedimg


from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.csrf import csrf_exempt
from django.utils import simplejson
from django.http import HttpResponse

import base64

@staff_member_required
@csrf_exempt
def bounce_image(request):
    postedimg = request.FILES.get('image', False)
    print request.FILES
    if postedimg:
        fdata = postedimg.read(postedimg.size)
        b = base64.b64encode(fdata)
        from StringIO import StringIO
        import Image
        newimg = Image.open(StringIO(fdata))
        return HttpResponse(simplejson.dumps({'imagedata': 'data:%s;base64,%s' % (newimg.format, b)}))
    return HttpResponse(simplejson.dumps({'error': 'No file'}))

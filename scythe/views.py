from django.http import HttpResponse
from django.shortcuts import get_object_or_404

from scythe.models import Original

def original_src(request):
    if 'id' in request.GET.keys():
        orig = get_object_or_404(Original, id=request.GET['id'])
        return HttpResponse(orig.image.url)
    return HttpResponse('')

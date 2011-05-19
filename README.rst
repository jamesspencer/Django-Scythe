Lightweight image cropping/resizing widget for ImageFields in the Django admin
==============================================================================

Attach this widget to any ImageField in your ModelAdmin classes to enable cropping/resizing of images.

Users will be able to crop any image to your specified dimensions using jCrop (http://deepliquid.com/content/Jcrop.html) displayed in jqModal (http://dev.iceburg.net/jquery/jqModal/)


Installation
============

First, install to your path using pip, easy_install or manually:

    $ python setup.py install

Second, copy the scythe/media/django-scythe directory to your MEDIA_ROOT.


Usage
=====

First, add scythe to your installed apps:

    $ INSTALLED_APPS = (
    $     ....
    $     'scythe',
    $     ...
    $ )

Second, import the widget in the admin.py for your chosen app:

    $ from scythe.widgets import AdminScytheWidget
    
Third, assign the widget to the ImageField of your choice:

    $ if db_field.name == 'myimagefield':
    $     return db_field.formfield(widget=AdminScytheWidget(
    $         attrs={'dimensions': {'w': 250, 'h': 125}},
    $     ))
        
Now view the Add/Change screen to see the widget in action


Requirements
============

    * Django (>=1.2)
    * PIL


Browser Support
===============

    * FF 3.6+
    * Chrome 10+
    * Safari 6


ToDo:
=====

    * Better Handling of Transparent PNGs
    * Handle image cropping/resizing in the browser
    * Check compatibility with previous versions of Django
    * Add an IE shim (should one be available/possible)
    * Amend instructions for non drag-and-drop aware browsers
    * Provide better fallbacks for browsers that don't support the DOM File API
    * Integrate with staticfiles


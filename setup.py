#!/usr/bin/env python
from distutils.core import setup
import os

version='0.1'
package = 'scythe'

setup(
    name = 'django-scythe',
    version = version,
    author  = 'jamesspencer',
    author_email = 'get.james.s@gmail.com',
    url = 'https://github.com/jamesspencer/django-scythe',
    download_url = 'https://github.com/jamesspencer/django-scythe/tarball/master',

    description = 'Lightweight image cropping/resizing widget for ImageFields in the Django admin.',
    long_description = open('README.rst').read(),
    license = 'MIT license',
    requires = ['django (>=1.2)'],

    packages=['scythe'],
    package_data={
        'cropper': [
            'media/django-scythe/*',
        ]
    },

    classifiers=[
        'Development Status :: 4 - Beta',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: MIT License',
        'Programming Language :: Python',
        'Topic :: Software Development :: Libraries :: Python Modules'
    ],
)

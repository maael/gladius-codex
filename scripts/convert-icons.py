#!/usr/bin/python

import os

# pip install wand
## install https://imagemagick.org/script/download.php#windows
from wand import image

# traverse root directory, and list directories as dirs and files as files
for root, dirs, files in os.walk("../public/game"):
    print(root)
    for file in files:
        f = os.sep.join([root, file])
        with image.Image(filename=f) as img:
          img.compression = "no"
          img.save(filename=f.replace('.dds', '.png'))
          os.remove(f)

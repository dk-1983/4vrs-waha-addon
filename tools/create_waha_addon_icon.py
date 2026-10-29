"""Render our own 4VRS app icon; no upstream WhatsApp/WAHA branding is reused."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

image = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((12, 12, 244, 244), radius=52, fill='#14665f')
draw.rounded_rectangle((42, 48, 214, 184), radius=28, fill='#ffffff')
draw.polygon([(64, 171), (64, 210), (110, 175)], fill='#ffffff')
font = ImageFont.load_default(size=64)
draw.text((128, 114), '4V', font=font, anchor='mm', fill='#14665f')
target = Path(__file__).resolve().parents[1] / 'addons/fourvrs_waha/icon.png'
image.save(target)
print(target)

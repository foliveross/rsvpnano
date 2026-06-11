@echo off
cd /d "%~dp0.."
set RSVP_FIRMWARE_VERSION=0.1.0-foliveross
pio run -e waveshare_esp32s3_usb_msc

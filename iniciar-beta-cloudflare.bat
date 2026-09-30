@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0iniciar-beta-cloudflare.ps1"
if errorlevel 1 (
  echo.
  echo Nao foi possivel iniciar o beta. Veja a mensagem acima.
  pause
)

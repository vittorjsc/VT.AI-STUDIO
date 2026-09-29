@echo off
setlocal
cd /d "%~dp0"
rem Carrega a chave persistida pelo setx mesmo se o Explorer foi aberto antes dela.
if not defined OPENAI_API_KEY (
  for /f "tokens=1,2,*" %%A in ('reg query "HKCU\Environment" /v OPENAI_API_KEY 2^>nul') do if /I "%%A"=="OPENAI_API_KEY" set "OPENAI_API_KEY=%%C"
)
set "VT_NODE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined VT_NODE set "VT_NODE=%%N"
if not defined VT_NODE if exist "%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" set "VT_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not defined VT_NODE (
  echo.
  echo ERRO: Node.js nao foi encontrado.
  echo Instale o Node.js LTS e abra este arquivo novamente.
  echo https://nodejs.org/
  pause
  exit /b 1
)
rem Reutiliza o servidor deste aplicativo; evita iniciar outro Node na mesma porta.
set "VT_STUDIO_EXPECTED=%~dp0dados-vt-ai"
powershell -NoProfile -Command "try { $r=Invoke-RestMethod 'http://127.0.0.1:4173/api/health' -TimeoutSec 2; if ($r.ok -and [IO.Path]::GetFullPath($r.dataDir).TrimEnd('\') -eq [IO.Path]::GetFullPath($env:VT_STUDIO_EXPECTED).TrimEnd('\')) { exit 0 }; exit 2 } catch { exit 1 }" >nul 2>&1
if errorlevel 2 (
  echo ERRO: A porta 4173 pertence a outra copia do VT.AI. Feche essa copia antes de abrir esta.
  pause
  exit /b 1
)
if not errorlevel 1 goto :ready
start "VT.AI Studio - Servidor" /B "%VT_NODE%" server.mjs
for /l %%I in (1,1,15) do (
  powershell -NoProfile -Command "try { $r=Invoke-RestMethod 'http://127.0.0.1:4173/api/health' -TimeoutSec 2; if ($r.ok -and [IO.Path]::GetFullPath($r.dataDir).TrimEnd('\') -eq [IO.Path]::GetFullPath($env:VT_STUDIO_EXPECTED).TrimEnd('\')) { exit 0 }; exit 1 } catch { exit 1 }" >nul 2>&1
  if not errorlevel 1 goto :ready
  timeout /t 1 /nobreak >nul
)
echo.
echo ERRO: O VT.AI Studio nao iniciou. Verifique a janela do servidor.
pause
exit /b 1
:ready
start "VT.AI Studio" http://127.0.0.1:4173

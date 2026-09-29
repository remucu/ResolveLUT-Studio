@echo off
:: =========================================================================
:: ResolveLUT Studio - Windows 11 Administrator Launcher
:: Porneste DaVinci Resolve Studio cu drepturi de Administrator (UAC Elevated)
:: =========================================================================
chcp 65001 >nul

:: Verificare drepturi de Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Solicitare permisiuni de Administrator Windows 11...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo [+] Rulare cu drepturi de Administrator confirmata!
set "RESOLVE_PATH=C:\Program Files\Blackmagic Design\DaVinci Resolve\Resolve.exe"

if exist "%RESOLVE_PATH%" (
    echo [+] Se porneste DaVinci Resolve Studio ca Administrator...
    start "" "%RESOLVE_PATH%"
) else (
    echo [!] DaVinci Resolve Studio nu a fost gasit la locatia implicita:
    echo     %RESOLVE_PATH%
    pause
)

@echo off
REM Script para renombrar archivos eliminando espacios
REM Guarda este archivo como "renombrar.bat" en la carpeta gallery

echo Renombrando archivos...

cd patients\patient-001\gallery

setlocal enabledelayedexpansion
set count=1

for %%f in (*.jpeg *.jpg *.png) do (
    ren "%%f" "foto-!count!.jpeg"
    set /a count+=1
    echo Renombrado: %%f
)

echo.
echo Listo! Archivos renombrados.
echo Presiona cualquier tecla para salir...
pause >nul

@echo off
if "%1"=="" (
    echo Uso: .\deploy-push.bat TU_TOKEN
    pause & exit /b 1
)

set SUPABASE_ACCESS_TOKEN=%1
set PROJECT_REF=zgihrwqfyvgyapbwzkvw

echo [1/4] Vinculando proyecto...
npx supabase link --project-ref %PROJECT_REF%

echo.
echo [2/4] Configurando secrets VAPID...
npx supabase secrets set VAPID_PUBLIC_KEY=BD8r001C3ekRLo4w-S-lQZTXHtucMBenkucKZgqmoca07SfMg35MF1EFFIIubc7RI6RVKJW12iSlV-KGpUolUu4 VAPID_PRIVATE_KEY=ocyqo_apG_T4sCfCFCLWhkIN9n9YB-cvCgUC3ag1rEc VAPID_SUBJECT=mailto:labdentalprodigy@gmail.com

echo.
echo [3/4] Desplegando send-push...
npx supabase functions deploy send-push --no-verify-jwt

echo.
echo [4/4] Funciones activas:
npx supabase functions list

echo.
echo Listo. send-push desplegada.
pause

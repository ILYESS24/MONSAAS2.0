@echo off
chcp 65001 >nul
title Cursor Clone - Déploiement

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                     🚀 CURSOR CLONE                        ║
echo ║                     DÉPLOIEMENT RAPIDE                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

:menu
echo Choisissez votre plateforme de déploiement :
echo.
echo [1] 🌐 Netlify (Recommandé)
echo [2] ⚡ Vercel
echo [3] 🌊 Surge (Plus rapide)
echo [4] 📄 GitHub Pages (Gratuit)
echo [5] 🛠️  Déploiement manuel
echo [6] 📖 Ouvrir la page de déploiement
echo [0] ❌ Quitter
echo.

set /p choice="Votre choix (0-6) : "

if "%choice%"=="1" goto netlify
if "%choice%"=="2" goto vercel
if "%choice%"=="3" goto surge
if "%choice%"=="4" goto github
if "%choice%"=="5" goto manual
if "%choice%"=="6" goto deploy_page
if "%choice%"=="0" goto exit

echo Choix invalide. Veuillez réessayer.
timeout /t 2 >nul
goto menu

:netlify
echo.
echo 📦 Déploiement sur Netlify...
node deploy.js netlify
goto end

:vercel
echo.
echo 📦 Déploiement sur Vercel...
node deploy.js vercel
goto end

:surge
echo.
echo 📦 Déploiement sur Surge...
node deploy.js surge
goto end

:github
echo.
echo 📦 Configuration GitHub Pages...
node deploy.js github
goto end

:manual
echo.
echo 📋 Instructions de déploiement manuel :
echo.
echo 1. Ouvrez index.html dans votre navigateur
echo 2. Ou utilisez un serveur local :
echo    python -m http.server 8000
echo    Puis allez sur http://localhost:8000
echo.
echo 3. Pour un déploiement en ligne :
echo    - Glissez-déposez index.html sur https://netlify.com
echo    - Utilisez Surge : npm install -g surge ^&^& surge
echo.
pause
goto menu

:deploy_page
echo.
echo 🌐 Ouverture de la page de déploiement...
start deploy.html
echo Page ouverte dans votre navigateur par défaut.
echo.
pause
goto menu

:end
echo.
echo ✅ Déploiement terminé !
echo.
pause

:exit
echo.
echo Au revoir ! 👋
timeout /t 2 >nul
exit /b 0

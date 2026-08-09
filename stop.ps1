# stop.ps1 - arrete proprement Qdrant (les donnees restent grace au volume persistant).
# Le backend et le frontend doivent etre fermes manuellement (Ctrl+C dans leurs fenetres,
# ou juste fermer les fenetres PowerShell ouvertes par start.ps1).

Set-Location $PSScriptRoot
Write-Host "==> Arret de Qdrant..." -ForegroundColor Cyan
docker compose stop
Write-Host "OK Qdrant arrete. Tes documents sont conserves (volume persistant)." -ForegroundColor Green

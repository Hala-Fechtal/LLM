# start.ps1 - lance tout le projet (Qdrant + backend + frontend) en un coup.
# Usage : clic droit > "Executer avec PowerShell", ou depuis un terminal : .\start.ps1

$root = $PSScriptRoot

Write-Host "==> Demarrage de Qdrant (Docker)..." -ForegroundColor Cyan
Set-Location $root
docker compose up -d

Write-Host "==> Attente que Qdrant soit pret..." -ForegroundColor Cyan
$ready = $false
for ($i = 0; $i -lt 20; $i++) {
    try {
        Invoke-RestMethod -Uri "http://localhost:6333/collections" -TimeoutSec 2 | Out-Null
        $ready = $true
        break
    } catch {
        Start-Sleep -Seconds 1
    }
}
if (-not $ready) {
    Write-Host "ERREUR : Qdrant n'a pas demarre a temps. Verifie Docker Desktop." -ForegroundColor Red
    exit 1
}
Write-Host "OK Qdrant pret sur http://localhost:6333" -ForegroundColor Green

Write-Host "==> Demarrage du backend FastAPI (nouvelle fenetre)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\backend'; .\venv\Scripts\Activate.ps1; uvicorn main:app --reload --port 8000"
)

Write-Host "==> Demarrage du frontend Next.js (nouvelle fenetre)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit", "-Command",
    "Set-Location '$root\llm'; npm run dev"
)

Write-Host "==> Ouverture du navigateur dans 6 secondes..." -ForegroundColor Cyan
Start-Sleep -Seconds 6
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "OK Tout est lance :" -ForegroundColor Green
Write-Host "   - Qdrant   : http://localhost:6333"
Write-Host "   - Backend  : http://localhost:8000"
Write-Host "   - Frontend : http://localhost:3000"
Write-Host ""
Write-Host "Pour tout arreter : ferme les 2 fenetres PowerShell ouvertes, puis lance stop.ps1"

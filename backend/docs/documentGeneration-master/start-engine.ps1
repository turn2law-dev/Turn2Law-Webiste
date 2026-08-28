# Turn2Law Document Generation Engine — Start Script
# Run from the documentGeneration-master folder:
#   cd backend\docs\documentGeneration-master
#   .\start-engine.ps1

$docgenDir = Join-Path $PSScriptRoot "docgen"
$python    = Join-Path $docgenDir ".venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
  Write-Host "ERROR: .venv not found. Run setup first:" -ForegroundColor Red
  Write-Host "  cd docgen"
  Write-Host "  python -m venv .venv"
  Write-Host "  & .\.venv\Scripts\python.exe -m pip install -r requirements.txt"
  exit 1
}

Write-Host "Starting Turn2Law Document Engine on http://localhost:8000 ..." -ForegroundColor Cyan
Set-Location $docgenDir
& $python -m uvicorn api:app --host 0.0.0.0 --port 8000

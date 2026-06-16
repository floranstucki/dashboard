param (
  [string]$File
)

if (-not $File) {
  Write-Host "Utilisation : .\scripts\restore-db.ps1 backups\nom_du_backup.sql"
  exit
}

Get-Content $File | docker exec -i home-dashboard-mysql mysql `
  -u root `
  -prootfinsight `
  home_dashboard

Write-Host "Base restaurée depuis : $File"
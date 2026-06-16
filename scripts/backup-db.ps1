$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupPath = "backups/home_dashboard_$timestamp.sql"

docker exec home-dashboard-mysql mysqldump `
  -u root `
  -prootfinsight `
  home_dashboard > $backupPath

Write-Host "Backup créé : $backupPath"
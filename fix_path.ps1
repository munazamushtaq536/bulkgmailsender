# PowerShell script to add Node.js to PATH permanently
# Run this script as Administrator for permanent fix

Write-Host "Adding Node.js to PATH..." -ForegroundColor Yellow

$nodePath = "C:\Program Files\nodejs"
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")

if ($currentPath -notlike "*$nodePath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$nodePath", "User")
    Write-Host "✅ Node.js added to PATH successfully!" -ForegroundColor Green
    Write-Host "⚠️  Please close and reopen your terminal for changes to take effect." -ForegroundColor Yellow
} else {
    Write-Host "✅ Node.js is already in PATH!" -ForegroundColor Green
}

Write-Host "`nTo use Node.js in current session, run:" -ForegroundColor Cyan
Write-Host '$env:PATH += ";C:\Program Files\nodejs"' -ForegroundColor White


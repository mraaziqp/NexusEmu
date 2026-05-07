# NexusEmu silent launcher (PowerShell version — better process control)
# Drop a shortcut to this in shell:startup to auto-run on login

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$log  = Join-Path $root "nexus-server.log"

# Kill any old instance on port 3000 first
Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }

# Start server detached (hidden window, output to log)
$proc = Start-Process -FilePath "cmd.exe" `
  -ArgumentList "/C npm run dev > `"$log`" 2>&1" `
  -WorkingDirectory $root `
  -WindowStyle Hidden `
  -PassThru

# Brief wait then open the app
Start-Sleep -Seconds 4
Start-Process "http://localhost:3000"

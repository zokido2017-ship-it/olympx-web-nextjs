# E2E: OTP -> form session complete -> /organizations -> refresh -> logout x3
param(
  [int]$Cycles = 3,
  [string]$BaseUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Stop"
$phone = '{"phone_code":"91","mobile_number":"8923907897","otp":"2468"}'
$ok = 0

function Test-ProtectedPage {
  param($Session, [string]$Label)
  $r = Invoke-WebRequest `
    -Uri "$BaseUrl/organizations" `
    -WebSession $Session `
    -UseBasicParsing `
    -TimeoutSec 120
  if ($r.StatusCode -ne 200) { throw "$Label orgs status $($r.StatusCode)" }
  if ($r.Content -match '/login\?next') { throw "$Label orgs HTML contains login redirect" }
}

for ($i = 1; $i -le $Cycles; $i++) {
  Write-Host "`n--- Cycle $i ---"
  $s = New-Object Microsoft.PowerShell.Commands.WebRequestSession

  $val = Invoke-RestMethod `
    -Uri "$BaseUrl/api/olympx/api/v1/auth/validate-otp" `
    -Method POST -ContentType "application/json" -Body $phone `
    -WebSession $s -TimeoutSec 120
  if (-not $val.token) { throw "no token cycle $i" }

  $form = "token=$([uri]::EscapeDataString($val.token))&next=/organizations"
  $complete = Invoke-WebRequest `
    -Uri "$BaseUrl/api/auth/olympx-session/complete" `
    -Method POST -WebSession $s `
    -ContentType "application/x-www-form-urlencoded" -Body $form `
    -MaximumRedirection 0 -UseBasicParsing -TimeoutSec 180
  if ($complete.StatusCode -notin 200,301,302,303,307,308) {
    throw "complete bad status $($complete.StatusCode)"
  }

  $get = Invoke-RestMethod -Uri "$BaseUrl/api/auth/olympx-session" -WebSession $s -TimeoutSec 60
  if (-not $get.ok) { throw "GET session failed cycle $i" }

  Test-ProtectedPage -Session $s -Label "initial"
  Test-ProtectedPage -Session $s -Label "refresh"
  Write-Host "cycle $i OK"

  Invoke-RestMethod -Uri "$BaseUrl/api/auth/olympx-session" -Method DELETE -WebSession $s | Out-Null
  $after = Invoke-RestMethod -Uri "$BaseUrl/api/auth/olympx-session" -WebSession $s -ErrorAction SilentlyContinue
  if ($after.ok) { throw "session still active after logout" }
  $ok++
}

Write-Host "`nAll $ok/$Cycles cycles passed."

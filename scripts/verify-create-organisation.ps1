# E2E: OTP login -> create organisation -> list includes new org
param([string]$BaseUrl = "http://localhost:3000")

$ErrorActionPreference = "Stop"
$s = New-Object Microsoft.PowerShell.Commands.WebRequestSession

$val = Invoke-RestMethod `
  -Uri "$BaseUrl/api/olympx/api/v1/auth/validate-otp" `
  -Method POST -ContentType "application/json" `
  -Body '{"phone_code":"91","mobile_number":"8923907897","otp":"2468"}' `
  -WebSession $s -TimeoutSec 120

Invoke-RestMethod `
  -Uri "$BaseUrl/api/auth/olympx-session" `
  -Method POST -WebSession $s `
  -ContentType "application/json" `
  -Body (@{ token = $val.token } | ConvertTo-Json) | Out-Null

$slug = "verify-org-$(Get-Date -Format 'yyyyMMddHHmmss')"
$body = @{
  name = "Verify Org $slug"
  slug = $slug
  description = "Created by verify-create-organisation.ps1"
  website = "example.com"
  settings = @{ category = "pro"; location = "Test City" }
} | ConvertTo-Json

$created = Invoke-RestMethod `
  -Uri "$BaseUrl/api/organisations" `
  -Method POST -WebSession $s `
  -ContentType "application/json" `
  -Body $body -TimeoutSec 120

if ($created.slug -ne $slug) { throw "slug mismatch" }

$list = Invoke-RestMethod `
  -Uri "$BaseUrl/api/olympx/api/v1/organisations?per_page=50" `
  -WebSession $s -TimeoutSec 120

$found = $list.data | Where-Object { $_.slug -eq $slug }
if (-not $found) { throw "created org not in list" }

Write-Host "OK created $($created.name) slug=$slug listed in directory"

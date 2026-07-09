#!/usr/bin/env pwsh
# deploy-amplify.ps1 — Deploy frontend to AWS Amplify Hosting
# Usage: .\scripts\deploy-amplify.ps1

$APP_ID    = "d1s2bq5nqqwd9y"
$BRANCH    = "staging"
$REGION    = "ap-southeast-1"
$DIST_PATH = (Resolve-Path "$PSScriptRoot\..\frontend\dist").Path
$ZIP_PATH  = "$PSScriptRoot\..\frontend-dist.zip"

Write-Host "📦 Building frontend..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\frontend"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed!"; exit 1 }
Pop-Location

Write-Host "🗜️  Creating ZIP (forward slashes)..." -ForegroundColor Cyan
if (Test-Path $ZIP_PATH) { Remove-Item $ZIP_PATH }

Add-Type -Assembly System.IO.Compression.FileSystem
Add-Type -Assembly System.IO.Compression

$stream  = [System.IO.File]::Open($ZIP_PATH, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)

Get-ChildItem -Path $DIST_PATH -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($DIST_PATH.Length + 1).Replace('\', '/')
    $entry       = $archive.CreateEntry($relativePath, [System.IO.Compression.CompressionLevel]::Optimal)
    $entryStream = $entry.Open()
    $fileStream  = [System.IO.File]::OpenRead($_.FullName)
    $fileStream.CopyTo($entryStream)
    $fileStream.Close()
    $entryStream.Close()
}
$archive.Dispose(); $stream.Close()

Write-Host "🚀 Creating Amplify deployment..." -ForegroundColor Cyan
$json   = aws amplify create-deployment --app-id $APP_ID --branch-name $BRANCH --region $REGION
$obj    = $json | ConvertFrom-Json
$jobId  = $obj.jobId
$url    = $obj.zipUploadUrl

Write-Host "⬆️  Uploading to Amplify (Job $jobId)..." -ForegroundColor Cyan
curl.exe -X PUT -H "Content-Type: application/zip" --data-binary "@$ZIP_PATH" "$url" --silent -w "HTTP: %{http_code}`n"

Write-Host "▶️  Starting deployment..." -ForegroundColor Cyan
aws amplify start-deployment --app-id $APP_ID --branch-name $BRANCH --job-id $jobId --region $REGION | Out-Null

Write-Host "⏳ Waiting for deployment..." -ForegroundColor Yellow
do {
    Start-Sleep 5
    $status = (aws amplify get-job --app-id $APP_ID --branch-name $BRANCH --job-id $jobId --region $REGION | ConvertFrom-Json).job.summary.status
    Write-Host "   Status: $status"
} while ($status -notin @("SUCCEED","FAILED","CANCELLED"))

Remove-Item $ZIP_PATH -Force -ErrorAction SilentlyContinue

if ($status -eq "SUCCEED") {
    Write-Host "✅ Deploy thành công!" -ForegroundColor Green
    Write-Host "🌐 URL: https://main.$APP_ID.amplifyapp.com" -ForegroundColor Green
} else {
    Write-Error "❌ Deploy thất bại: $status"
}

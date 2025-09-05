if (-Not (Test-Path -Path "dist" -PathType Container)) {
    Write-Host "Error: dist folder does not exist. Please build the project first."
    exit 1
}

npx http-server dist -P http://localhost:8080?
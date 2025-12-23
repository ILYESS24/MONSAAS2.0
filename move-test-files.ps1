# Script to move test files to test/ directory

New-Item -ItemType Directory -Path "test" -Force | Out-Null

# Get all test files in current directory
$testFiles = Get-ChildItem -File | Where-Object {
    $_.Name -match '\.(spec|cjs|test)\.' -or $_.Name -match '^test-'
}

foreach ($file in $testFiles) {
    Write-Host "Moving $($file.Name) to test/"
    Move-Item $file.FullName -Destination "test/" -Force
}

Write-Host "Test files moved successfully"

param(
    [Parameter(Mandatory=$true)][string]$NodePath,
    [Parameter(Mandatory=$true)][string]$IconPath,
    [Parameter(Mandatory=$true)][string]$OutputDirectory
)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$output = [IO.Path]::GetFullPath($OutputDirectory)
if (Test-Path -LiteralPath $output) { throw 'Output directory already exists; use a fresh directory.' }
$app = Join-Path $output '拾句'
New-Item -ItemType Directory -Path $app -Force | Out-Null
# Allowlist only: never copy a user's deployed directory, database, logs or backups.
Copy-Item -LiteralPath $NodePath -Destination (Join-Path $app 'node.exe')
Copy-Item -LiteralPath $IconPath -Destination (Join-Path $app 'shiju.ico')
Copy-Item -LiteralPath (Join-Path $root 'tmp\text-library-server.mjs') -Destination (Join-Path $app 'server.mjs')
Copy-Item -LiteralPath (Join-Path $root 'dist-text-library') -Destination (Join-Path $app 'public') -Recurse
Copy-Item -LiteralPath (Join-Path $root 'tmp\portable-notices') -Destination (Join-Path $app 'licenses') -Recurse
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'portable\启动拾句.cmd') -Destination $output
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'portable\使用说明.txt') -Destination $output
$forbidden = Get-ChildItem -LiteralPath $output -Recurse -File | Where-Object {
    $_.Name -match 'text-library\.json|\.bak$|\.log$|\.docx?$|qa-|original\.|color-audit|legacy-import-preview'
}
if ($forbidden) { throw 'Unexpected personal or test files in package.' }
$zip = "$output.zip"
if (Test-Path -LiteralPath $zip) { throw 'ZIP already exists; use a fresh output directory.' }
Compress-Archive -LiteralPath $output -DestinationPath $zip -CompressionLevel Optimal
Get-Item -LiteralPath $zip | Select-Object FullName, Length

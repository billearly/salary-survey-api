Write-Host Creating build...

npm ci
npm build
npm prune --production

Write-Host Compressing...

$currentLocation = Get-Location;
$build = "$currentLocation\build\*.*";
$modules = "$currentLocation\node_modules";
$destination = "$currentLocation\deploy";

# Create folder for deployment zip if it doesn't exist
if (!(Test-Path -Path $destination)) {
  New-Item -Path $destination -ItemType Directory
}

# Delete any old build artifacts if they exist
if (Test-Path -Path "$destination\lambda.zip") {
  Remove-Item "$destination\lambda.zip"
}

$compress = @{
  Path = $build, $modules
  CompressionLevel = "Optimal"
  DestinationPath = "$destination\lambda.zip"
}

Compress-Archive @compress

Write-Host Done.
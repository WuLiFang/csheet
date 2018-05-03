
param (
    [switch]$build = $false
)

$NUM_CORES = Get-WmiObject -Class Win32_ComputerSystem | Select-Object -ExpandProperty "NumberOfLogicalProcessors"
$env:SENTRY_DSN = Get-Content .\SENTRY_DSN
$env:NUM_WORKERS = $NUM_CORES

docker-machine env | Invoke-Expression
if ($build) {
    git clean -fdX *.pyc
    npx webpack --mode production
    docker-compose up -d --build
    docker system prune -f
}
else {
    docker-compose up -d
}

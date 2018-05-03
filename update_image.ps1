
param (
    [switch]$build = $false
)

$env:SENTRY_DSN = Get-Content .\SENTRY_DSN

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

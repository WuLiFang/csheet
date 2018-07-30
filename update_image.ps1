
param (
    [switch]$build = $false
)

docker-machine env | Invoke-Expression
if ($build) {
    git clean -fdX *.pyc
    npm run build
    docker-compose up -d --build
    docker system prune -f
}
else {
    docker-compose up -d
}

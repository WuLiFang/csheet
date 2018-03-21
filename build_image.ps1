docker-machine env | Invoke-Expression
docker build . -t csheet
if ($LASTEXITCODE) {
    exit $LASTEXITCODE
}

"# Remove unsued images"
docker system prune -f
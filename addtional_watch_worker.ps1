$IMAGE = "csheet"
$SENTRY_DSN = Get-Content .\SENTRY_DSN
$MAPPING = ('-v', '/z:/z', '-v', '/srv/csheet:/srv/csheet')
$SENTRY_OPTIONS = ('--link', 'sentry-server:sentry', '-e', "SENTRY_DSN=$SENTRY_DSN")

"# Setup"
docker-machine env | Invoke-Expression

"# Start watch"
docker run -d `
    --restart always `
    $MAPPING `
    $SENTRY_OPTIONS `
    --cpus 1 `
    --cpu-shares 768 `
    $IMAGE `
    run watch

docker ps
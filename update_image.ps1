$IMAGE = "csheet"
$CONTAINER = "csheet_server"
$GENERATION_CONTAINER = "$CONTAINER-generation"
$WATCH_CONTAINER = "$CONTAINER-watch"
$SENTRY_DSN = Get-Content .\SENTRY_DSN
$MAPPING = ('-v', '/z:/z', '-v', '/srv/csheet:/srv/csheet')
$SENTRY_OPTIONS = ('--link', 'sentry-server:sentry', '-e', "SENTRY_DSN=$SENTRY_DSN")


"# Setup"
docker-machine env | Invoke-Expression

if ((docker inspect -f="{{.Image}}" $CONTAINER) -eq
    (docker image inspect -f="{{.Id}}" $IMAGE)) {
    "# No need to update."
    docker start $CONTAINER
    exit
}

"# Remove old container"
docker stop ($CONTAINER, $GENERATION_CONTAINER, $WATCH_CONTAINER)
docker rm ($CONTAINER, $GENERATION_CONTAINER, $WATCH_CONTAINER)

"# Start server"
docker run -d `
    -p 60000:80 `
    --restart always `
    $MAPPING `
    $SENTRY_OPTIONS `
    --name $CONTAINER $IMAGE

"# Start watch"
docker run -d `
    --restart always `
    $MAPPING `
    $SENTRY_OPTIONS `
    --name $WATCH_CONTAINER $IMAGE `
    python run_watch_worker.py
    
"# Start generation"
docker run -d `
    --restart always `
    $MAPPING `
    $SENTRY_OPTIONS `
    --name $GENERATION_CONTAINER $IMAGE `
    python run_generation_worker.py


docker ps
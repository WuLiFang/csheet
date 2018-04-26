$IMAGE = "csheet"
$CONTAINER = "csheet_server"
$GENERATION_CONTAINER = "$CONTAINER-generation"
$WATCH_CONTAINER = "$CONTAINER-watch"
$SENTRY_DSN = Get-Content .\SENTRY_DSN
$MAPPING = ('-v', '/z:/z', '-v', '/srv/csheet:/srv/csheet')
$SENTRY_OPTIONS = ('--link', 'sentry-server:sentry', '-e', "SENTRY_DSN=$SENTRY_DSN")
$NUM_CORES = Get-WmiObject -Class Win32_ComputerSystem | Select-Object -ExpandProperty "NumberOfLogicalProcessors"
$NUM_WORKERS = (($NUM_CORES * 2) + 1)
$GENERATION_CPUS = (($NUM_CORES / 2) + 1)

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
    --cpu-shares 2048 `
    -e NUM_WOKERS=$NUM_WORKERS `
    --name $CONTAINER $IMAGE

"# Start watch"
docker run -d `
    --restart always `
    $MAPPING `
    $SENTRY_OPTIONS `
    --cpu-shares 768 `
    --name $WATCH_CONTAINER $IMAGE `
    run watch
    
"# Start generation"

docker run -d `
    --restart always `
    $MAPPING `
    $SENTRY_OPTIONS `
    --cpus $GENERATION_CPUS `
    --cpu-shares 512 `
    --name $GENERATION_CONTAINER $IMAGE `
    run generation


docker ps
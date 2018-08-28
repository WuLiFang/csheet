"# Setup"
docker-machine env | Invoke-Expression

function check_result ($reson) {
    if ($LASTEXITCODE) {
        throw $reson
    }
}

function check_sentry_key () {
    if (-not $SENTRY_SECRET_KEY){
        throw "Get-SentryKey first"
    }
}

function Get-SentryKey () {
    $ret = $(docker exec sentry-server printenv SENTRY_SECRET_KEY; $is_exists = ($LASTEXITCODE -eq 0))
    if ($is_exists -bxor 1) {
        $ret = $(docker run --rm sentry config generate-secret-key)
    }
    Set-Variable SENTRY_SECRET_KEY $ret -Scope Global
    "Key set in variable: 'SENTRY_SECRET_KEY'"
}

function New-SentryDatabase () {
    docker run -d --name sentry-redis --restart always redis
    check_result "# Start redis failed"
    docker run -d --name sentry-postgres -e POSTGRES_PASSWORD=sentry -e POSTGRES_USER=sentry --restart always postgres
    check_result "# Start postgres failed"
}

function Set-SentryDatabase () {
    check_sentry_key
    docker run -it --rm -e SENTRY_SECRET_KEY=$SENTRY_SECRET_KEY --link sentry-postgres:postgres --link sentry-redis:redis sentry upgrade
}

function Start-Sentry () {
    check_sentry_key
    docker run -d --name sentry-server -e SENTRY_SECRET_KEY=$SENTRY_SECRET_KEY --link sentry-redis:redis --link sentry-postgres:postgres -p 9000:9000 --restart always sentry
    docker run -d --name sentry-cron -e SENTRY_SECRET_KEY=$SENTRY_SECRET_KEY --link sentry-postgres:postgres --link sentry-redis:redis --restart always sentry run cron
    docker run -d --name sentry-worker-1 -e SENTRY_SECRET_KEY=$SENTRY_SECRET_KEY --link sentry-postgres:postgres --link sentry-redis:redis --restart always sentry run worker
}

function Remove-Sentry () {
        $choice =  Read-Host "Remove all sentry containner(Database not include)?(y/N)" 
        if ($choice.toUpper() -eq "Y"){
            "# Backup sentry key"
            Get-SentryKey
            docker stop sentry-worker-1 sentry-cron sentry-server
            docker rm sentry-worker-1 sentry-cron sentry-server
        }
}

function New-SentryUser () {
    docker run -it --rm -e SENTRY_SECRET_KEY=$SENTRY_SECRET_KEY --link sentry-redis:redis --link sentry-postgres:postgres sentry createuser
}
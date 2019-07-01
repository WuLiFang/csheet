#! /bin/bash

if [ "$1" = "run" ]; then
    case $2 in
    "" )
        gunicorn -w 1 \
            -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
            -b 0.0.0.0:80 csheet:APP
        ;;
    "beat" )
        celery -A csheet:CELERY beat ${@:3}
        ;;
    "worker" )
        useradd worker
        chown worker ${STORAGE:-/srv/csheet}
        celery -A csheet:CELERY worker --uid $(id -u worker) --gid $(id -g worker) ${@:3}
        ;;
    * )
        echo "Can not recognize argument: $2"
        ;;
    esac
else 
   /bin/bash -l -c "$*"
fi

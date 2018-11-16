#! /bin/bash

if [ "$1" = "run" ]; then
    case $2 in
    "" )
        export CSHEET_NO_SOCKETIO=1
        gunicorn -w 1 \
            --worker-connections $WORKER_CONNECTIONS \
            -k gevent \
            -b 0.0.0.0:80 csheet:APP
        ;;
    "socketio" )
        gunicorn -w 1 \
            -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
            -b 0.0.0.0:80 csheet:APP
        ;;
    "beat" )
        celery -A csheet.CELERY beat
        ;;
    "worker" )
        useradd worker
        setfacl -R -m d:u:worker:rwX /srv/csheet 
        setfacl -R -m u:worker:rwX /srv/csheet 
        celery -A csheet.CELERY worker --uid $(id -u worker) --gid $(id -g worker)
        ;;
    * )
        echo "Can not recognize argument: $2"
        ;;
    esac
else 
   /bin/bash -l -c "$*"
fi
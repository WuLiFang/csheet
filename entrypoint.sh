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
    "generation" )
        python ./run_generation_worker.py
        ;;
    "watch" )
        python ./run_watch_worker.py
        ;;
    "worker" )
        celery -A csheet.CELERY worker --loglevel=info
        ;;
    * )
        echo "Can not recognize argument: $2"
        ;;
    esac
else
   /bin/bash -l -c "$*"
fi
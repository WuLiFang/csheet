#! /bin/bash

if [ "$1" = "run" ]; then
    if [ "$2" = "" ]; then
        gunicorn -w 1 \
            -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
            --worker-connections $WORKER_CONNECTIONS \
            -b 0.0.0.0:80 csheet:APP
    elif [ "$2" = "generation" ]; then
        python ./run_generation_worker.py
    elif [ "$2" = "watch" ]; then
        python ./run_watch_worker.py
    else
        echo "Can not recognize argument: $2"
    fi
else
   /bin/bash -l -c "$*"
fi
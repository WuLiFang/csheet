#! /bin/bash

if [ "$1" = "run" ]; then
    if [ "$2" = "" ]; then
        if [ ! -z $CSHEET_CERTFILE ] && [ ! -z $CSHEET_KEYFILE ] && [ -f $CSHEET_CERTFILE ] && [ -f $CSHEET_KEYFILE ]; then
            gunicorn -w 1 \
                -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
                --certfile=$CSHEET_CERTFILE --keyfile=$CSHEET_KEYFILE \
                -b 0.0.0.0:80 csheet:APP
        else
            echo "No certification file, use http."
            gunicorn -w 1 \
                -k geventwebsocket.gunicorn.workers.GeventWebSocketWorker \
                -b 0.0.0.0:80 csheet:APP
        fi
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
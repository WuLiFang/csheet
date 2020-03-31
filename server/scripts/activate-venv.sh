#!/bin/sh


if [[ -f ./.env ]];then
. ./.env
fi

export PYTHONPATH
export FLASK_APP


if [[ ${OS} == Windows_NT ]]; then
. .venv/Scripts/activate;
else
. .venv/bin/activate;
fi



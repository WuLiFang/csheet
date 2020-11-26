#!/bin/bash

docker-compose exec -T csheet csheet-cmd backup $@

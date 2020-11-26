#!/bin/bash

./db-backup.sh
find ./backup/csheet-* -size 0 -print -delete
ls ./backup/csheet-* | head -n -30 | xargs -r rm

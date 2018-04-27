# See https://stackoverflow.com/questions/43665243/invalid-self-signed-ssl-cert-subject-alternative-name-missing for req.conf
openssl req -x509 -nodes -newkey rsa:4096 -days 365 -utf8 -sha256 -config req.conf -keyout csheet.key -out csheet.crt
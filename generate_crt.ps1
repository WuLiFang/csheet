openssl req -x509 -newkey rsa:4096 -days 365 -keyout key.pem -out csheet.crt
openssl rsa -in key.pem -out csheet.key 
if ($?) {
    Remove-Item key.pem 
}

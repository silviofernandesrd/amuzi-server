# amuzi-server

## instalar
*executar comando abaixo para instalar as dependencias*

*executar na raiz do projeto*
```
npm install
```
## executar servidor web
*executar comando abaixo para executar o stream*

*executar na raiz do projeto*
```
npm start
```
## executar servidor websocket
*executar comando abaixo para executar o server, onde se conectaram os usuarios*

*executar na raiz do projeto*
```
node scripts/server.js
```

## criar chaves ssl
```
openssl genrsa 1024 > host.key
chmod 400 host.key
openssl req -new -x509 -nodes -sha1 -days 365 -key host.key -out host.cert
```

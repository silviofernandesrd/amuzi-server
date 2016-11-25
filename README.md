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

## criar chaves ssl self-signed para development
```
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

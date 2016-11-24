// const request = require('request-promise')
const fs = require('fs');
const https = require('https');
const privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
const certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const port = 3000

const credentials = {key: privateKey, cert: certificate};

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))
app.use('/scripts', express.static(__dirname + '/scripts'));

app.get('/stream', (request, response) => {
  response.render('stream', {})
})

app.get('/server', (request, response) => {
  response.render('server', {})
})

app.get('/server-old', (request, response) => {
  response.render('server/index-old', {})
})
// app.get('/', (request, response) => {
//   require('./app/index')
//   response.send('Hello from Express!')
// })

var httpsServer = https.createServer(credentials, app);

// app.listen(port, (err) => {
httpsServer.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

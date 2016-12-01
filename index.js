// const request = require('request-promise')
var tls = require('tls');
var crypto = require('crypto');
var fs = require('fs');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');
var pkey = fs.readFileSync('sslcert/key.pem');
var pcert = fs.readFileSync('sslcert/cert.pem')
var path = require('path')
var express = require('express')
var exphbs = require('express-handlebars')
var app = express()
var port = 3000
var credentials;
var expressLogging = require('express-logging');
var logger = require('logops');

var options = {
    key: pkey,
    cert: pcert
};

if (tls.createSecureContext) {
  credentials = tls.createSecureContext({key: privateKey, cert: certificate});
} else {
  credentials = crypto.createCredentials({key: privateKey, cert: certificate});
}

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}));

app.use(expressLogging(logger));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));
app.use('/scripts', express.static(__dirname + '/scripts'));


app.get('/client', (request, response) => {
  response.render('client', {})
});

app.get('/server', (request, response) => {
  response.render('server', {})
});

app.get('/server-old', (request, response) => {
  response.render('server/index-old', {})
});
// app.get('/', (request, response) => {
//   require('./app/index')
//   response.send('Hello from Express!')
// })

var httpsServer = https.createServer(options, app);

// app.listen(port, (err) => {
httpsServer.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})

//require our websocket library
var WebSocketServer = require('ws').Server;
//creating a websocket server at port 9090
var wss = new WebSocketServer({
  port: 9090//,
  // server: httpsServer
});
//all connected to the server users
var users = {};
//when a user connects to our sever
wss.on('connection', function(connection) {
   console.log("Usuario conectado");
   //when server gets a message from a connected user
   connection.on('message', function(message) {
      var data; 
      //accepting only JSON messages
      try {
         data = JSON.parse(message);
      } catch (e) {
         console.log("Invalid JSON");
         data = {};
      }
      //switching type of the user message
      switch (data.type) {
         //when a user tries to login
         case "login":
            console.log("Usuario logado >", data.name);
            //if anyone is logged in with this username then refuse
            if(users[data.name]) {
               sendTo(connection, {
                  type: "login",
                  success: false
               });
            } else {
               //save user connection on the server
               users[data.name] = connection;
               connection.name = data.name;
               sendTo(connection, {
                  type: "login",
                  success: true
               });
            }
            break;
         case "offer":
            //for ex. UserA wants to call UserB
            console.log("Sending offer to: ", data.name);
            //if UserB exists then send him offer details
            var conn = users[data.name];
            if(conn != null) {
               //setting that UserA connected with UserB
               connection.otherName = data.name;
               sendTo(conn, {
                  type: "offer",
                  offer: data.offer,
                  name: connection.name
               });
            }
            break;
         case "answer":
            console.log("Sending answer to: ", data.name);
            //for ex. UserB answers UserA
            var conn = users[data.name];

            if(conn != null) {
               connection.otherName = data.name;
               sendTo(conn, {
                  type: "answer",
                  answer: data.answer
               });
            }
            break;
         case "candidate":
            console.log("Sending candidate to:",data.name);
            var conn = users[data.name];

            if(conn != null) {
               sendTo(conn, {
                  type: "candidate",
                  candidate: data.candidate
               });
            }
            break;
         case "leave":
            console.log("Fechando conexão >", data.name);
            var conn = users[data.name];
            conn.otherName = null;
            //notify the other user so he can disconnect his peer connection
            if(conn != null) {
               sendTo(conn, {
                  type: "leave"
               });
            }
            break;
         default:
            sendTo(connection, {
               type: "error",
               message: "Command not found: " + data.type
            });
            break;
      }
   });
   //when user exits, for example closes a browser window
   //this may help if we are still in "offer","answer" or "candidate" state
   connection.on("close", function() {
      if(connection.name) {
         delete users[connection.name];
         if(connection.otherName) {
            console.log("Disconnecting from ", connection.otherName);
            var conn = users[connection.otherName];
            conn.otherName = null;
            if(conn != null) {
               sendTo(conn, {
                  type: "leave"
              });
            }
         }
      }
   });
   sendTo(connection, "Conexão estabelecida");
});
function sendTo(connection, message) {
   connection.send(JSON.stringify(message));
}

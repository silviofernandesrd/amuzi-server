//our talk
var name;
var connectedUser;
var conn;

//connecting to our signaling server
var WS = window.WebSocket || window.MozWebSocket;

if (WS){
    // conn = new WS('ws://192.168.0.18:9090');
    conn = new WS('ws://192.168.25.223:9090');
}

conn.onopen = function () {
   console.log("Conectado ao servidor");
   name = Math.random().toString(36).substring(10);
   if (name.length > 0) {
     send({
        type: "login",
        name: name
     });
   }
};

//when we got a message from a signaling server
conn.onmessage = function (msg) {
   var data = JSON.parse(msg.data);
   switch(data.type) {
      case "login":
         handleLogin(data.success);
         break;
      //when somebody wants to call us
      case "offer":
         handleOffer(data.offer, data.name);
         break;
      case "answer":
         handleAnswer(data.answer);
         break;
      //when a remote peer sends an ice candidate to us
      case "candidate":
         handleCandidate(data.candidate);
         break;
      case "leave":
         handleLeave();
         break;
      default:
         break;
   }
};

conn.onerror = function (err) {
   console.log("Got error", err);
};

//alias for sending JSON encoded messages
function send(message) {
   //attach the other peer username to our messages
   if (connectedUser) {
      message.name = connectedUser;
   }

   conn.send(JSON.stringify(message));
};

//******
//UI selectors block
//******

var connectTalk = document.querySelector('#connectTalk');
var talkCodeInput = document.querySelector('#talkCodeInput');
var connectBtn = document.querySelector('#connectBtn');

var talkPage = document.querySelector('#talkPage');
var callTotalkCodeInput = document.querySelector('#callTotalkCodeInput');

var closeTalkBtn = document.querySelector('#closeTalkBtn');
var localAudio = document.querySelector('#localAudio');
var remoteAudio = document.querySelector('#remoteAudio');

var yourConn;
var stream;

talkPage.style.display = "none";
connectTalk.style.display = "none";

function handleLogin(success) {
  if (success === false) {
    alert("Ooops...try a different username");
  } else {
    talkPage.style.display = "none";
    connectTalk.style.display = "block";
    //**********************
    //Starting a peer connection
    //**********************
    //getting local audio stream
    navigator.webkitGetUserMedia({ video: false, audio: true }, function (myStream) {
       stream = myStream;
       // mute audio
       stream.getAudioTracks()[0].enabled = false;
       //displaying local audio stream on the page
      //  localAudio.src = window.URL.createObjectURL(stream);
       //using Google public stun server
       var configuration = {
          "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
       };
       yourConn = new webkitRTCPeerConnection(configuration);
       // setup stream listening
       yourConn.addStream(stream);
       //when a remote user adds stream to the peer connection, we display it
       yourConn.onaddstream = function (e) {
          remoteAudio.src = window.URL.createObjectURL(e.stream);
       };
       // Setup ice handling
       yourConn.onicecandidate = function (event) {
         console.log("event.candidate >", event.candidate);
          if (event.candidate) {
             send({
                type: "candidate",
                candidate: event.candidate
             });
          }
       };
    }, function (error) {
       console.log(error);
    });
  }
};
//initiating a call
connectBtn.addEventListener("click", function () {
   var callToUsername = talkCodeInput.value;
   if (callToUsername.length > 0) {
      connectedUser = callToUsername;
      console.log(yourConn)
      // create an offer
      yourConn.createOffer(function (offer) {
         send({
            type: "offer",
            offer: offer
         });
         yourConn.setLocalDescription(offer);
      }, function (error) {
         alert("Error when creating an offer");
      });
      talkPage.style.display = "block";
      connectTalk.style.display = "none";
   }
});

//when somebody sends us an offer
function handleOffer(offer, name) {
   connectedUser = name;
   yourConn.setRemoteDescription(new RTCSessionDescription(offer));

   //create an answer to an offer
   yourConn.createAnswer(function (answer) {
      yourConn.setLocalDescription(answer);

      send({
         type: "answer",
         answer: answer
      });

   }, function (error) {
      alert("Error when creating an answer");
   });

};

//when we got an answer from a remote user
function handleAnswer(answer) {
   yourConn.setRemoteDescription(new RTCSessionDescription(answer));
};

//when we got an ice candidate from a remote user
function handleCandidate(candidate) {
   yourConn.addIceCandidate(new RTCIceCandidate(candidate));
};

//hang up
closeTalkBtn.addEventListener("click", function () {
   send({
      type: "leave"
   });

   handleLeave();
});

function handleLeave() {
   connectedUser = null;
  //  remoteAudio.src = null;

   yourConn.close();
   yourConn.onicecandidate = null;
   yourConn.onaddstream = null;

   talkPage.style.display = "none";
   connectTalk.style.display = "block";
};

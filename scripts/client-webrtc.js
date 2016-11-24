//checks if the browser supports WebRTC
var stream;

function getNavigatorMedia() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
     || navigator.mozGetUserMedia || navigator.msGetUserMedia;
}

function hasUserMedia() {
   getNavigatorMedia();
   return !!navigator.getUserMedia;
}

if (hasUserMedia()) {
   getNavigatorMedia();

   //get both video and audio streams from user's camera
   navigator.getUserMedia({ video: true, audio: true }, function (s) {
      stream = s;
      var video = document.querySelector('video');

      //insert stream into the video tag
      video.src = window.URL.createObjectURL(stream);
   }, function (err) {});

}else {
   alert("Error. WebRTC is not supported!");
}

btnGetAudioTracks.addEventListener("click", function(){
   console.log("getAudioTracks");
   console.log(stream.getAudioTracks());
});

btnGetTrackById.addEventListener("click", function(){
   console.log("getTrackById");
   console.log(stream.getTrackById(stream.getAudioTracks()[0].id));
});

btnGetTracks.addEventListener("click", function(){
   console.log("getTracks()");
   console.log(stream.getTracks());
});

btnGetVideoTracks.addEventListener("click", function(){
   console.log("getVideoTracks()");
   console.log(stream.getVideoTracks());
});

btnRemoveAudioTrack.addEventListener("click", function(){
   console.log("removeAudioTrack()");
   stream.removeTrack(stream.getAudioTracks()[0]);
});

btnRemoveVideoTrack.addEventListener("click", function(){
   console.log("removeVideoTrack()");
   stream.removeTrack(stream.getVideoTracks()[0]);
});

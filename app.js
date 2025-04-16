// app.js

let localStream;
let peerConnection;
const startButton = document.getElementById('startButton');
const statusOutput = document.getElementById('statusOutput');

// Define signaling server URL (You can use a simple WebSocket or other signaling method)
const signalingServer = 'wss://your-signaling-server-url'; // Replace with your server

// Set up WebRTC connection and media stream
const startRadio = () => {
  // Access user's microphone
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      localStream = stream;
      statusOutput.textContent = 'Radio is On. Speak to communicate!';
      // Set up WebRTC peer connection
      setupPeerConnection(stream);
    })
    .catch((err) => {
      console.error('Error accessing microphone: ', err);
      statusOutput.textContent = 'Error accessing microphone';
    });
};

// Set up peer-to-peer connection
const setupPeerConnection = (stream) => {
  peerConnection = new RTCPeerConnection();
  peerConnection.addStream(stream);

  // Send audio to the remote peer
  peerConnection.onaddstream = (event) => {
    const audio = new Audio();
    audio.srcObject = event.stream;
    audio.play();
  };

  // Set up signaling server connection (for simplicity, using WebSocket)
  const socket = new WebSocket(signalingServer);
  
  socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'offer', data: { offer: 'data' } }));
  };

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'offer') {
      peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      peerConnection.createAnswer()
        .then((answer) => {
          peerConnection.setLocalDescription(answer);
          socket.send(JSON.stringify({ type: 'answer', answer: answer }));
        });
    }
  };

  socket.onerror = (error) => {
    console.error('Error with WebSocket connection: ', error);
  };
};

// Start the radio on button click
startButton.addEventListener('click', startRadio);

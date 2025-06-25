import { useEffect, useRef } from "react";

export const Receiver = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "identifyReceiver" }));
      console.log("Connected to a WebSocket Server");
    };
    startReceiving(socket);
  }, []);
  
  const startReceiving = async (socket:WebSocket | null) => {
    if (!socket) {
      console.log("Could not find websocket connection");
      return;
    }

    const pc = new RTCPeerConnection();

    pc.ontrack = (event) => {
      if (videoRef.current) {
        const newStream = new MediaStream([event.track]);
        videoRef.current.srcObject = newStream;
        console.log("stream", newStream);
      }
    };

    socket.onmessage = async (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "offer":
          pc.setRemoteDescription(message.sdp);
          const answer = await pc.createAnswer();
          pc.setLocalDescription(answer);
          socket.send(JSON.stringify({ type: "answer", sdp: answer }));
          break;
        case "iceCandidates":
          pc.addIceCandidate(message.candidates);
      }
    };
  };
 

  return (
    <div className="flex">
      Receiver
      <video ref={videoRef} autoPlay playsInline muted></video>
    </div>
  );
};

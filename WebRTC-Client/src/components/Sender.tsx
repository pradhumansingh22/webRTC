import { useEffect, useRef, useState } from "react";

export const Sender = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null); 

  useEffect(() => {
    const newSocket = new WebSocket("ws://localhost:8080");
    newSocket.onopen = () => {
      newSocket.send(JSON.stringify({ type: "identifySender" }));
      console.log("Connected to a WebSocket Server");
    };
    setSocket(newSocket);
  }, []);

  const start = async () => {
    if (!socket) {
      console.log("Unable to find websocket connection!");
      return;
    }

    const pc = new RTCPeerConnection();

    socket.onmessage = async (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case "answer":
          pc?.setRemoteDescription(message.sdp);
          break;
        case "iceCandidates":
          pc?.addIceCandidate(message.candidates);
      }
    };

    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        socket.send(
          JSON.stringify({ type: "iceCandidates", candidates: event.candidate })
        );
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      console.log(stream)
    }

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onnegotiationneeded = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.send(JSON.stringify({ type: "offer", sdp: offer }));
    };
  };

  return (
    <div>
      Sender{" "}
      <button className="space-x-2" onClick={start}>
        Send Video
      </button>
      <div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: "300px", marginTop: "10px" }}
        />
      </div>
    </div>
  );
};

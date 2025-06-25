import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 }, () => {
  console.log("Web socket server listening on port 8080");
});

let senderSocket: null | WebSocket = null;
let receiverSocket: null | WebSocket = null;

wss.on("connection", function connection(ws) {
  console.log("Connected to the Websocket server");

  ws.on("error", console.error);
  ws.on("message", function message(messageData: any) {
    const message = JSON.parse(messageData);
      switch (message.type) {
          case "identifySender":
              console.log("Sender joined")
              senderSocket = ws;
              break;
          case "identifyReceiver":
              console.log("Receiver Joined")
              receiverSocket = ws;
              break;
          case "offer":
              receiverSocket?.send(
                  JSON.stringify({ type: "offer", sdp: message.sdp })
              );
              console.log("Recieved offer")
              break;
          case "answer":
              console.log("Received answer")
        senderSocket?.send(
          JSON.stringify({ type: "answer", sdp: message.sdp })
        );
        break;
          case "iceCandidates":
              console.log("ice")
        if (ws === senderSocket) {
          receiverSocket?.send(
            JSON.stringify({
              type: "iceCandidates",
              candidates: message.candidates,
            })
          );
        } else if (ws === receiverSocket) {
          senderSocket?.send(
            JSON.stringify({
              type: "iceCandidates",
              candidates: message.candidates,
            })
          );
        }
        break;
    }
  });
});

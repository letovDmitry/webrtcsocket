const { Server } = require("socket.io");
let IO;

module.exports.initIO = (httpServer) => {
  IO = new Server(httpServer);

  IO.use((socket, next) => {
    if (socket.handshake.query) {
      let callerId = socket.handshake.query.callerId;
      socket.user = callerId;
      next();
    }
  });

  IO.on("connection", (socket) => {
    console.log(socket.user, "Connected");
    socket.join(socket.user);

    socket.on("call", (data) => {
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;
      let callType = data.callType;

      console.log('call')

      socket.to(calleeId).emit("newCall", {
        callerId: socket.user,
        rtcMessage,
        callType
      });
    });

    socket.on("answerCall", (data) => {
      let callerId = data.callerId;
      rtcMessage = data.rtcMessage;

      socket.to(callerId).emit("callAnswered", {
        callee: socket.user,
        rtcMessage: rtcMessage,
      });
    });

    socket.on("notAnswerCall", (data) => {
      let callerId = data.callerId;

      console.log('hangup')

      socket.to(callerId).emit("callNotAnswered", {
        callee: socket.user,
      });
    });

    socket.on("endCall", (data) => {
      let user2 = data.user2;

      console.log('end')

      socket.to(user2).emit("callEnded");
    });

    socket.on("toggleWebcam", (data) => {
      let user2 = data.user2;

      console.log('toggleWebcam')

      socket.to(user2).emit("webcamToggle");
    });

    socket.on("ICEcandidate", (data) => {
      console.log("ICEcandidate data.calleeId", data.calleeId);
      let calleeId = data.calleeId;
      let rtcMessage = data.rtcMessage;

      socket.to(calleeId).emit("ICEcandidate", {
        sender: socket.user,
        rtcMessage: rtcMessage,
      });
    });
  });
};

module.exports.getIO = () => {
  if (!IO) {
    throw Error("IO not initilized.");
  } else {
    return IO;
  }
};
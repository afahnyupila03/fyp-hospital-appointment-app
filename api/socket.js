const { Server } = require("socket.io");

let io;

module.exports = {
  init: (httpServer) => {
    if (!io) {
      // Ensure init is only called once.
      io = new Server(httpServer, {
        cors: {
          origin: "http://localhost:3000",
          methods: ["GET", "PUT", "POST", "DELETE"],
        },
      });
      console.log("socket.io init success");
    }
    return io;
  },

  getIo: () => {
    if (!io) throw new Error("socket.io init failure");

    return io;
  },
};

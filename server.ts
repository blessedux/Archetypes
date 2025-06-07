import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { initSocketServer } from "./lib/socket/socketServer";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Initialize Next.js
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  // Initialize Socket.io server with our handlers
  const io = initSocketServer(httpServer);

  httpServer
    .once("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.log(`Port ${port} is busy, trying ${port + 1}`);
        httpServer.listen(port + 1);
      } else {
        console.error(err);
        process.exit(1);
      }
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

import { PORT } from "./config.js";
import { setupWebSocket } from "./server.js";
import app from "./app.js";

const server = app.listen(PORT, () => {
  console.log(`Server running ${PORT}`);
});

const wss = setupWebSocket(server);
app.locals.wss = wss;

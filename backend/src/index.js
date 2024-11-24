import { PORT } from "./config.js";
import app from "./app.js";
import { pool } from "./db.js";

app.listen(PORT, () => {
  console.log(`Server running ${PORT}`);
});


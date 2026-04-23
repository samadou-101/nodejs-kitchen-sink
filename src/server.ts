import { app } from "./app";

const PORT = 3000;
const server = app.listen(PORT, () =>
  console.log("server is listening on port: " + PORT),
);

process.on("SIGTERM", () => {
  server.close(() => console.log("Server closed"));
});

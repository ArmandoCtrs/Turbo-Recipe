// packages/server/src/index.ts
import path from "path";
import express from "express";

const app = express();
//app.use("/api", apiRouter);

const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.listen(3001);
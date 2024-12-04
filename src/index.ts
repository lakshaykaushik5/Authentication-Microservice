import express from "express";
import { PORT } from "./env";

const app = express();

app.listen(PORT, () => {
  console.log("listening on port no ::::: ", PORT);
});

import bootstrap from "./app.controller.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const port = process.env.PORT;
bootstrap(app,express);

app.listen(port, () => {
    console.log(`Server is running on port `);
});
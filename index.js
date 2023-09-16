const mongoose = require("mongoose");
const express = require("express");
const db = require("./src/db/db");
const router = require("./src/router");
const PORT = 4000;
const app = express();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const date = new Date();
console.log("date============================",date)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/api", router);
app.listen(PORT, () => {
    console.log(`server is runing ${PORT}`)
})
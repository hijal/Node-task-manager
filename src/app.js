const express = require("express");
const auth = require("./middleware/auth");
const multer = require("multer");
require("./db/mongoose");
// require("dotenv").config();

const userRoute = require("./routes/user");
const taskRoute = require("./routes/task");

const port = process.env.PORT;

const app = express();

app.use(express.json());
app.use(userRoute);
app.use(taskRoute);

app.listen(port, () => {
    console.log(`server up and down on ${port}`);
});

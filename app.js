const express = require("express");
const http = require("http");
const dotEnv = require("dotenv");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const moment = require("moment");

//internal imports
const { notFoundHandler, errorHandler } = require("./middlewares/common/errorHandler");

//internal imports
const loginRouter = require("./router/loginRouter");
const inboxRouter = require("./router/inboxRouter");
const userRouter = require("./router/userRouter");
const roomRouter = require("./router/roomRouter");

dotEnv.config({ path: `./config.env` });
const app = express();
const server = http.createServer(app);

//socket creation
const io = require("socket.io")(server, { cors: { origin: "*" } });
global.io = io;

//set comment as app locals

app.locals.moment = moment;

//database connection
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    //console.log(con.connections);
    console.log("DB connection Succesfull");
  });

//req parser
// app.use(function (req, res, next) {
//   console.log(req.body);
//   next();
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//

//set view engines
app.set("view engine", "ejs");

//set static folder

app.use(express.static(path.join(__dirname, "public")));

//parse cookies
app.use(cookieParser(process.env.JWT_SECRET));

//routing set-sup
// app.use(function (req, res, next) {
//   console.log(req.url);
//   console.log(req.body);
//   console.log(req.file);
//   next();
// });
app.use(function (req, res, next) {
  res.header("Access-Controll-Allow-Origin", "*");
  res.header("Access-Controll-Allow-Headers", "Origin, X-Requested-With,Content-Type,Accept");
  next();
});

app.use("/", loginRouter);
app.use("/inbox", inboxRouter);
app.use("/users", userRouter);
app.use("/rooms", roomRouter);

//404 not found handler
app.use(notFoundHandler);

//common error handling
app.use(errorHandler);

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log("app running on port 3000");
});

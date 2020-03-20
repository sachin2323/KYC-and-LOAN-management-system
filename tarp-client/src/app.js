// require modules
require("dotenv").config();
const express = require("express");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const api = require("./routes/api");
const auth = require("./middleware/jwt-auth");
const bodyParser = require("body-parser");

// Config
const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.all("/api*", auth.isAuthenticated);
app.use("/api", api);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  console.log(err);

  return res.status(err.status).json({ error: err.message });
});

// Listen to PORT 3000
// console.clear();
app.listen(3000, () => {
  console.log("Listening to port 3000");
});

module.exports = app;

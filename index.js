const express = require('express');
const dotenv = require('dotenv');
var createError = require('http-errors');

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const _ = require('lodash');
const cors = require('cors')
var Promise = require("bluebird");
Promise.longStackTraces();

const app = express();
dotenv.config();
app.use(cors())
// app.use(cors({ origin : '*'}))
app.use(cookieParser());
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json({ limit: '50mb' }));
//app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//to get json data
// support parsing of application/json type post data

// const courseRoutes = require("./api/courses");
// const universityRoutes = require("./api/university");
// const wishRoutes = require("./api/wishlist");
// const roleRoutes = require("./api/role");
const userRoutes = require("./routes/auth");
// const applicationRoutes = require("./api/application");
// const ProfileRoutes = require("./api/profile");

// app.use("/api", courseRoutes);
// app.use("/api", universityRoutes);
// app.use("/api", wishRoutes);
// app.use("/api", roleRoutes);
app.use("/api", userRoutes);
// app.use("/api", applicationRoutes);
// app.use("/api", ProfileRoutes);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});




// let PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is up and running on ${PORT} ...`);
// });

module.exports = app
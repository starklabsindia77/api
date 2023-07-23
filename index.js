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
app.use(cors());
app.set('view engine', 'ejs');
// app.use(cors({ origin : '*'}))
app.use(cookieParser());
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json({ limit: '50mb' }));
//app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//to get json data
// support parsing of application/json type post data


const userRoutes = require("./routes/user");
const dashboardRoutes = require("./routes/dashboard");
const expertRoutes = require("./routes/expert");
const adminRoutes = require("./routes/adminauth");
const sessionsRoutes = require("./routes/sessions");
const slotsRoutes = require("./routes/slot");
const paymentRoutes = require("./routes/payment");
const appointmentRoutes = require("./routes/appointment");
const productRoutes = require("./routes/product");
const authRoutes = require("./routes/auth");
const emailRoutes = require("./routes/sendemail");

const blogRoutes = require("./routes/blogs");
const orderRoutes = require("./routes/order");
// const applicationRoutes = require("./api/application");
// const ProfileRoutes = require("./api/profile");

app.use("/api/admin", userRoutes);
app.use("/api/admin", dashboardRoutes);
app.use("/api/admin", expertRoutes);
app.use("/api/admin", sessionsRoutes);
app.use("/api/admin", productRoutes);
app.use("/api", slotsRoutes);
app.use("/api", paymentRoutes);
app.use("/api/admin", appointmentRoutes);
app.use("/api/admin", emailRoutes);
app.use("/api/admin", blogRoutes);
app.use("/api/admin", orderRoutes);
// app.use("/api", roleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", authRoutes);
// app.use("/api", applicationRoutes);
// app.use("/api", ProfileRoutes);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

app.get("/", function (req, res, next) {

  res.send({ message: "working test" })
})

// error handler
// app.use(function (err, req, res, next) {
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });




// let PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is up and running on ${PORT} ...`);
// });

module.exports = app
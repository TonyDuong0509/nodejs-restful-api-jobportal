require("express-async-errors");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routers
const authRouter = require("./routes/authRoute");
const adminRouter = require("./routes/adminRoute.js");
const categoryRouter = require("./routes/categoryRoute");
const companyRouter = require("./routes/companyRoute");
const jobRouter = require("./routes/jobRoute");
const jobseekerRouter = require("./routes/jobseekerRoute");
const resumeRouter = require("./routes/resumeRoute.js");

// Middlewares
const notFoundMiddleware = require("./middlewares/not-found");
const errorHandlerMiddleware = require("./middlewares/error-handler");

app.use(express.json());
app.use(cookieParser(process.env.JWT_TOKEN_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/category", categoryRouter);
app.use("/api/v1/company", companyRouter);
app.use("/api/v1/job", jobRouter);
app.use("/api/v1/jobseeker", jobseekerRouter);
app.use("/api/v1/resume", resumeRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;

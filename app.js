require("express-async-errors");
const express = require("express");
const morgan = require("morgan");

const app = express();

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routers

// Middlewares
const notFoundMiddleware = require("./middlewares/not-found");
const errorHandlerMiddleware = require("./middlewares/error-handler");

app.use(express.json());
app.use(express.static("./public"));

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;

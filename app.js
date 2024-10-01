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

app.use(express.json());

module.exports = app;

const express = require("express");
const router = express.Router();
const {
  getAllNotifications,
} = require("./../controllers/notificationController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router.get(
  "/",
  [authenticateUser, authorizePermissions("admin", "company", "jobseeker")],
  getAllNotifications
);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getSingleUser,
} = require("./../controllers/userController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router
  .route("/")
  .get(authenticateUser, authorizePermissions("admin"), getAllUsers);

router.route("/:id").get(authenticateUser, getSingleUser);

module.exports = router;

const express = require("express");
const router = express.Router();
const authController = require("./../controllers/authController");
const { authenticateUser } = require("./../middlewares/authentication");

router.post("/register", authController.register);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/logout", authenticateUser, authController.logout);

module.exports = router;

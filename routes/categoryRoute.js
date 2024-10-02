const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("./../controllers/categoryController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router
  .route("/")
  .post(authenticateUser, authorizePermissions("admin"), createCategory)
  .get(getAllCategories);

router
  .route("/:id")
  .get(getSingleCategory)
  .patch(authenticateUser, authorizePermissions("admin"), updateCategory)
  .delete(authenticateUser, authorizePermissions("admin"), deleteCategory);

module.exports = router;

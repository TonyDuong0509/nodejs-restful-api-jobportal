const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  createCategory,
  getSingleCategory,
  updateCategory,
  deleteCategory,
} = require("./../controllers/adminController");
const {
  authenticateUser,
  authorizePermissions,
} = require("./../middlewares/authentication");

router.get(
  "/get-all-users",
  [authenticateUser, authorizePermissions("admin")],
  getAllUsers
);

router.post(
  "/category",
  [authenticateUser, authorizePermissions("admin")],
  createCategory
);

router.delete(
  "/delete-user/:userId",
  [authenticateUser, authorizePermissions("admin")],
  deleteUser
);

router
  .route("/category/:id")
  .get([authenticateUser, authorizePermissions("admin")], getSingleCategory)
  .patch([authenticateUser, authorizePermissions("admin")], updateCategory)
  .delete([authenticateUser, authorizePermissions("admin")], deleteCategory);

module.exports = router;

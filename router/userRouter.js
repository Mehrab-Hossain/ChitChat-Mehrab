// external imports
const express = require("express");
const { check } = require("express-validator");
const bodyParser = require("body-parser");

// internal imports
const { addUser, getUser, isLogin, logout, login, getSearchUsers, sendInvite, getNotifications, notId } = require("../controller/userController");
const { addNewUserInRoomId } = require("../controller/roomControler");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const { avatarUpload, roomlogoUpload } = require("../middlewares/users/avaterUpload");
const { addUserValidators, addUserValidationHandler } = require("../middlewares/users/userValidators");

const router = express.Router();

// users page

// add user
router.post("/signUp", avatarUpload, addUserValidators, addUserValidationHandler, addUser);
router.post("/signIn", login);
router.post("/search/:id", getSearchUsers);
router.post("/invite", isLogin, sendInvite);
router.get("/logout", decorateHtmlResponse("Login"), logout);
router.get("/notifications", isLogin, getNotifications);
router.post("/notifications/:id", isLogin, addNewUserInRoomId);
router.delete("/notifications/:id", isLogin, notId);
router.get("/:id", getUser);

// remove user
// router.delete("/:id", checkLogin, requireRole(["admin"]), removeUser);

module.exports = router;

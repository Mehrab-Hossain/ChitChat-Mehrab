//external imports
const express = require("express");

const router = express.Router();

//internal exports
const { getLogin } = require("../controller/loginController");
const { isLogin, logout } = require("../controller/userController");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");

//login page

router.get("/", decorateHtmlResponse("Login"), isLogin, getLogin);

module.exports = router;

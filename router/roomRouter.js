const express = require("express");

const router = express.Router();

const { createRoom, addNewUserInRoom, getRoom, serachRoom, getRoomMembers } = require("../controller/roomControler");
const { roomlogoUpload } = require("../middlewares/users/avaterUpload");
const { addRoomValidators, addRoomValidationHandler } = require("../middlewares/users/userValidators");
const { isLogin } = require("../controller/userController");

router.post("/createroom", roomlogoUpload, addRoomValidators, addRoomValidationHandler, isLogin, createRoom);
router.post("/addnewUserInRoom", isLogin, addNewUserInRoom);
router.post("/search", isLogin, serachRoom);
router.get("/members/:id", isLogin, getRoomMembers);
router.get("/:id", isLogin, getRoom);

module.exports = router;

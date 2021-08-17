const express = require("express");

const { getInbox, sendMessage } = require("../controller/inboxController");
const { isLogin } = require("../controller/userController");
const attachmentUpload = require("../middlewares/inbox/attachmentUploader");

const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");

const router = express.Router();

router.get("/:id", decorateHtmlResponse("Inbox"), isLogin, getInbox);
router.post("/message", isLogin, attachmentUpload, sendMessage);

module.exports = router;

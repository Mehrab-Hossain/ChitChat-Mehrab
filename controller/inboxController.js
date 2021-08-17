//inbox
//get inbox

const People = require("../Models/peopleModel");
const Message = require("../Models/messageModel");
const Room = require("../Models/roomModel");

async function getInbox(req, res, next) {
  //console.log(res.locals.user);
  if (res.locals.user) {
    const loggedUser = res.locals.user;

    loggedUser.rooms.sort(function (a, b) {
      let x = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return x * -1;
    });

    let userRooms = [];
    loggedUser.rooms.forEach((el) => {
      userRooms.push(el._id);
    });
    res.render("dashboard", {
      user: loggedUser,
      userRooms,
    });
  } else {
    // console.log("hi from inbox controller");
    res.render("index");
  }
}

//send messages
async function sendMessage(req, res, next) {
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      let attachments = null;

      let str = req.body.message,
        slug = "";

      if (str && str.length < 20) {
        slug = `${str}....`;
      } else slug = `${str.slice(0, 15)}....`;

      if (req.files && req.files.length > 0) {
        attachments = [];
        req.files.forEach((element) => {
          attachments.push(element.filename);
        });
      }
      const newMessage = new Message({
        text: req.body.message,
        attachment: attachments,
        senderId: {
          id: res.locals.user._id,
          photo: res.locals.user.photo,
          name: res.locals.user.name,
        },
        roomId: req.body.roomId,
        slug,
      });

      //udpattiung room and new message
      const updateRoom = await Room.findById(req.body.roomId);
      updateRoom.updateTime = Date.now();
      updateRoom.slug = slug;
      await updateRoom.save();
      const result = await newMessage.save();

      //emmit socket event
      global.io.emit("new_message", {
        text: req.body.message,
        attachment: attachments,
        senderId: {
          id: res.locals.user._id,
          photo: res.locals.user.photo,
          name: res.locals.user.name,
        },
        roomId: req.body.roomId,
        slug,
      });

      res.status(200).json({
        status: "success",
        message: result,
      });
    } catch (error) {
      // console.log(error);
      res.status(400).json({
        status: "fail",
        msg: "Send Fail",
      });
    }
  }
}

//get inbox page
module.exports = {
  getInbox,
  sendMessage,
};

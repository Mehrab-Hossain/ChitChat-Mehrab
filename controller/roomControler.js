const Room = require("../Models/roomModel");
const People = require("../Models/peopleModel");
const Message = require("../Models/messageModel");
const { findById } = require("../Models/peopleModel");
const escape = require("../utilities/escape");
const createError = require("http-errors");

//create new room
async function createRoom(req, res, next) {
  //console.log(req.body.name.trim().lowerCase);
  const roomName = req.body.name.trim().toLowerCase().split(" ").join("-");
  let newRoom;
  if (req.files.length == 0) {
    newRoom = new Room({
      name: req.body.name,
      creatorId: res.locals.user.id,
      roomCode: `${roomName}-${res.locals.user.id}-${Date.now()}`,
      participants: res.locals.user.id,
    });
  } else {
    newRoom = new Room({
      name: req.body.name,
      creatorId: res.locals.user.id,
      roomCode: `${roomName}-${res.locals.user.id}-${Date.now()}`,
      participants: res.locals.user.id,
      roomlogo: req.files[0].filename,
    });
  }
  // console.log(newRoom);
  try {
    const result = await newRoom.save();
    res.locals.user.rooms.push(result._id);
    await res.locals.user.save();
    console.log("room succesfully created");
    res.status(200).json({
      status: "success",
      newRoom: result,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "fail",
      error,
    });
  }
}

//add new user in the room

async function addNewUserInRoom(req, res, next) {
  if (!res.locals.user) {
    res.status(500).json({
      status: "Invalid",
      msg: "Please Login first...",
    });
  }
  const requestUserId = res.locals.user._id;
  const requestedRoomCode = req.body.roomCode;
  let user, reqRoom;

  try {
    user = await People.findById(requestUserId);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      msg: error,
    });
  }
  try {
    reqRoom = await Room.findOne({ roomCode: requestedRoomCode });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      msg: error,
    });
  }

  if (!reqRoom) {
    res.status(500).json({
      status: "Invalid",
      msg: "Invalid Room Code",
    });
  } else if (!user) {
    // console.log(user);
    res.status(500).json({
      status: "Invalid",
      msg: "Can't find the user",
    });
  } else if (reqRoom && reqRoom.participants.includes(requestUserId)) {
    res.status(500).json({
      status: "Invalid",
      msg: "Already Added in the room",
    });
  } else {
    //updating rooms participants
    // console.log(reqRoom);
    reqRoom.participants.push(requestUserId);
    await reqRoom.save();

    //updating user Room
    console.log(reqRoom._id);

    user.rooms.push(reqRoom._id);
    await user.save();

    res.status(200).json({
      status: "success",
      msg: "User Successfully added in the room",
      newRoom: reqRoom,
    });
  }
}

///
async function addNewUserInRoomId(req, res, next) {
  if (!res.locals.user) {
    res.status(500).json({
      status: "Invalid",
      msg: "Please Login first...",
    });
  }
  const requestUserId = res.locals.user._id;
  const requestedRoomCode = req.body.roomCode;
  let user, reqRoom;

  try {
    user = await People.findById(requestUserId);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      msg: error,
    });
  }
  try {
    reqRoom = await Room.findOne({ _id: requestedRoomCode });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      msg: error,
    });
  }

  if (!reqRoom) {
    res.status(500).json({
      status: "Invalid",
      msg: "Invalid Room Code",
    });
  } else if (!user) {
    // console.log(user);
    res.status(500).json({
      status: "Invalid",
      msg: "Can't find the user",
    });
  } else if (reqRoom && reqRoom.participants.includes(requestUserId)) {
    res.status(500).json({
      status: "Invalid",
      msg: "Already Added in the room",
    });
  } else {
    //updating rooms participants
    // console.log(reqRoom);
    reqRoom.participants.push(requestUserId);
    await reqRoom.save();

    //updating user Room
    console.log(reqRoom._id);

    user.rooms.push(reqRoom._id);
    await user.save();

    res.status(200).json({
      status: "success",
      msg: "User Successfully added in the room",
      newRoom: reqRoom,
    });
  }
}

async function getRoom(req, res, next) {
  const reqroomId = req.params.id;
  let messages;

  if (!res.locals.user) {
    res.render("index");
  }

  try {
    const room = await Room.findById(reqroomId);
    const messages = await Message.find({ roomId: reqroomId });
    console.log(reqroomId);
    if (room) {
      const user = res.locals.user;
      res.status(200).json({
        status: "success",
        room,
        user,
        messages,
      });
    } else {
      throw createError("Room Not find");
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: "fail",
      error: "unKown error!",
    });
  }
}

async function getRoomMembers(req, res, next) {
  const reqroomId = req.params.id;

  if (!res.locals.user) {
    res.render("index");
  }

  try {
    const room = await Room.findById(reqroomId).populate({
      path: "participants",
    });
    if (room) {
      //console.log(room);
      res.status(200).json({
        status: "success",
        room,
      });
    } else {
      throw createError("Room Not find");
    }
  } catch (error) {
    // console.log(error);
    res.status(400).json({
      status: "fail",
      error: "unKown error!",
    });
  }
}

async function serachRoom(req, res, next) {
  try {
    const query = escape(req.body.roomName);
    const name_search_regex = new RegExp(query, "i");
    //console.log(name_search_regex);
    let room;
    if (query !== "") {
      room = await Room.find({ name: name_search_regex });
    }
    if (room) {
      let rooms = [];
      // console.log(room.length);
      room.forEach((x) => {
        if (x.participants.includes(res.locals.user._id)) rooms.push(x);
        else console.log(x.name);
      });
      // console.log(rooms.length);
      res.status(200).json({
        status: "success",
        rooms,
      });
    } else {
      res.status(200).json({
        status: "fail",
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(400).json({
      status: "fail",
      msg: "unkown error!",
    });
  }
}

module.exports = {
  createRoom,
  addNewUserInRoom,
  getRoom,
  serachRoom,
  addNewUserInRoomId,
  getRoomMembers,
};

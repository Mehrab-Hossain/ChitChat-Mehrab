const { unlink } = require("fs");
const { promisify } = require("util");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../Models/peopleModel");
const People = require("../Models/peopleModel");
const Room = require("../Models/roomModel");
const Invite = require("../Models/invitesModel");
const createHttpError = require("http-errors");
const escape = require("../utilities/escape");

//signToken
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;

  //console.log("Token created and send succesfully" + token);
  res.status(200).json({
    status: "success",
    message: "User was added successfully!",
    id: user._id,
    slug: user.slug,
  });
};

// add user
async function addUser(req, res, next) {
  //console.log(req.body);
  let newUser;
  //const hashedPassword = await bcrypt.hash(req.body.password, 10);

  if (req.files && req.files.length > 0) {
    newUser = new User({
      ...req.body,
      photo: req.files[0].filename,
      rooms: process.env.COMMON_ROOM,
    });
  } else {
    newUser = new User({
      ...req.body,
      rooms: process.env.COMMON_ROOM,
    });
  }

  // save user or send error
  try {
    const result = await newUser.save();
    // const newUserInd = await People.findOne({email : result.email});
    const commonRoom = await Room.findById(process.env.COMMON_ROOM);
    commonRoom.participants.push(result._id);
    await commonRoom.save();

    // console.log("success user added");
    createSendToken(result, res);
  } catch (err) {
    // console.log(err);
    res.json({
      errors: {
        common: {
          msg: "Unknown error occured!",
          error: err,
        },
      },
    });
  }
}

//get a user

async function getUser(req, res, next) {
  if (!req.locals.login) {
    res.render("index");
  }
  try {
    ///console.log("hello");
    const user = await People.findByIdAndUpdate(req.params.id).populate({
      path: "rooms",
    });
    // res.render("dashboard", {
    //   user,
    // });
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      error,
    });
  }
}

// login
async function login(req, res, next) {
  //console.log(req.body);
  if (!req.body.email || !req.body.password) {
    res.status(200).json({
      status: "fail",
      message: "Invalid Email or Password",
    });
  } else {
    try {
      const email = req.body.email;
      const user = await People.findOne({ email }).select("+password");
      if (!user || !(await user.correctPassword(req.body.password, user.password))) {
        res.status(200).json({
          status: "fail",
          message: "Invalid Email or Password",
        });
      } else {
        (user.password = undefined), createSendToken(user, res);
      }
    } catch (error) {
      res.status(200).json({
        status: "fail",
        message: "Invalid Email or Password",
      });
    }
  }
}

///checking user logging or not
async function isLogin(req, res, next) {
  let token;
  if (req.cookies.jwt) {
    try {
      token = req.cookies.jwt;
      //console.log(token);

      //verifying token
      const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
      //console.log(decoded.id);

      //checking user exits
      const currentUser = await People.findById(decoded.id);
      if (!currentUser) {
        //console.log("yes form currentUser not found!");
        next();
      }

      //check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        // console.log("decoded iat");
        return next();
      }

      //there is a login user
      res.locals.user = currentUser;
      // console.log(currentUser);
      //console.log(currentUser);

      return next();
    } catch (error) {
      //console.log(error);

      return next();
    }
  }
  next();
}

//logoout
function logout(req, res) {
  // console.log("hello from log out");
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
  });
}

//get serach users

async function getSearchUsers(req, res, next) {
  // console.log(req.body.userName);
  const nameQuery = escape(req.body.userName);
  const name_search_regex = new RegExp(nameQuery, "i");
  const email_search_regex = new RegExp("^" + nameQuery + "$", "i");
  const openedRoom = await Room.findById(req.params.id);
  const invites = await Invite.find({ roomId: req.params.id }).select("userId");
  let invitearray = [];
  invites.forEach((el) => {
    invitearray.push(JSON.stringify(el.userId));
    //console.log(typeof JSON.stringify(el.userId));
  });
  //console.log(invitearray);

  if (nameQuery === "") {
    res.status(400).json({
      status: "fail",
      msg: "Give userName / Email to serach",
    });
  }
  try {
    const users = await People.find(
      {
        $or: [
          {
            name: name_search_regex,
          },
          {
            email: email_search_regex,
          },
        ],
      },
      "name photo _id"
    );
    let notAddedUsers = [];
    ///console.log(users);
    users.forEach((userx) => {
      if (!openedRoom.participants.includes(userx._id) && !invitearray.includes(JSON.stringify(userx._id))) {
        // console.log(userx._id);
        // console.log(invitearray.includes(userx._id));
        // console.log(typeof userx._id);
        notAddedUsers.push(userx);
      }
    });

    if (notAddedUsers.length === 0) {
      res.status(200).json({
        status: "success",
        msg: "NO user to invite",
        users: notAddedUsers,
      });
    } else {
      res.status(200).json({
        status: "success",
        users: notAddedUsers,
      });
    }
  } catch (error) {
    // console.log(error);
    res.status(400).json({
      status: "fail",
      msg: "unKnown Error!!",
    });
  }
}

//sending invites
async function sendInvite(req, res, next) {
  const room = await Room.findById(req.body.roomCode).select("name roomlogo");
  const newInvite = new Invite({
    roomId: req.body.roomCode,
    userId: req.body.userCode,
    name: room.name,
    photo: room.roomlogo,
  });
  try {
    await newInvite.save();
    const user = await People.findById(req.body.userCode);
    user.lastNotificationGet = Date.now();

    res.status(200).json({
      status: "success",
      user: req.body.userCode,
    });
    // console.log(newInvite);

    global.io.emit("new_invite", {
      user: req.body.userCode,
    });
  } catch (error) {
    // console.log(error);
    res.status(400).json({
      status: "fail",
    });
  }
}

async function getNotifications(req, res, next) {
  if (!res.locals.user) {
    res.render("index");
  }

  try {
    const notifications = await Invite.find({ userId: res.locals.user._id });
    // console.log(notifications);
    if (notifications) {
      res.status(200).json({
        status: "success",
        notifications,
      });
    } else {
      res.status(200).json({
        status: "fail",
        msg: "currently there is no invitations",
      });
    }
  } catch (error) {
    //console.log(error);
    res.status(400).json({
      status: "fail",
      msg: "unknown error!!",
    });
  }
}

///notfication delete
async function notId(req, res, next) {
  // console.log(req.params.id);
  if (!res.locals.user) {
    res.render("index");
  } else {
    // console.log("YEs");
    try {
      const notifications = await Invite.findByIdAndDelete(req.params.id);
      if (notifications) {
        res.status(200).json({
          status: "success",
          notifications,
        });
      } else {
        res.status(200).json({
          status: "fail",
          msg: "failed to delete",
        });
      }
    } catch (error) {
      // console.log(error);
      res.status(400).json({
        status: "fail",
        msg: "unknown error!!",
      });
    }
  }
}

async function updateUser(req, res, next) {
  const user = res.locals.user;
  if (!res.locals.user) {
    res.render("index");
  } else {
    try {
      const user = await People.findOne({ email: res.locals.user.email }).select("+password");
      /// console.log(user);
      if (!user || !(await user.correctPassword(req.body.password, user.password))) {
        // console.log("hello");
        res.json({
          errors: {
            common: {
              msg: "Password is In Correct",
            },
          },
        });
      }
    } catch (error) {
      // console.log(error);
      res.json({
        errors: {
          common: {
            msg: "Unkown Error",
          },
        },
      });
    }
  }

  let coun = 0;
  if (req.files && req.files.length > 0) {
    user.photo = req.files[0].filename;
    coun += 1;
  }
  if (req.body.name) {
    user.name = req.body.name;
    coun += 1;
  }

  if (coun === 0) {
    res.json({
      errors: {
        common: {
          msg: "Please provide info to update",
        },
      },
    });
  } else {
    try {
      user.save();
      // console.log("suc");
      res.status(200).json({
        status: "success",
      });
    } catch (error) {
      // console.log(error);
      res.json({
        errors: {
          common: {
            msg: "Unknown error occured!",
          },
        },
      });
    }
  }
}

module.exports = {
  addUser,
  getUser,
  isLogin,
  logout,
  login,
  getSearchUsers,
  sendInvite,
  getNotifications,
  notId,
  updateUser,
};

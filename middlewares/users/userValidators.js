// external imports
const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const path = require("path");
const { unlink } = require("fs");
const { isLogin } = require("../../controller/userController");

// internal imports
const User = require("../../Models/peopleModel");

// add user
const addUserValidators = [
  check("name").isLength({ min: 1 }).withMessage("Name is required").isAlpha("en-US", { ignore: " -" }).withMessage("Name must not contain anything other than alphabet").trim(),
  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .trim()
    .custom(async (value) => {
      try {
        const user = await User.findOne({ email: value });
        if (user) {
          throw createError("Email already is use!");
        }
      } catch (err) {
        // console.log(err);
        throw createError(err.message);
      }
    }),
  check("password").isStrongPassword().withMessage("Password must be at least 8 characters long & should contain at least 1 lowercase, 1 uppercase, 1 number & 1 symbol"),
];

const addUserValidationHandler = function (req, res, next) {
  const errors = validationResult(req);

  const mappedErrors = errors.mapped();
  //console.log(mappedErrors);

  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    // remove uploaded files
    if (req.files.length > 0) {
      const { filename } = req.files[0];
      unlink(path.join(__dirname + `../../../public/images/users/${filename}`), (err) => {
        if (err) console.log(err);
      });
    }
    res.status(500).json({
      errors: mappedErrors,
    });
  }
};

const addRoomValidators = [
  check("name").isLength({ min: 1 }).withMessage("Room name is required").isAlpha("en-US", { ignore: " -" }).withMessage("Name must not contain anything other than alphabet").trim(),
];

const addRoomValidationHandler = function (req, res, next) {
  const errors = validationResult(req);

  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    //remove uploaded files
    // console.log("Hello from validator Error BOOM!");
    if (req.files.length > 0) {
      const { filename } = req.files[0];
      unlink(path.join(__dirname + `../../../public/images/rooms/${filename}`), (err) => {
        if (err) console.log(err);
      });
    }

    // response the errors
    // console.log(req.body);
    // console.log(mappedErrors);
    res.status(500).json({
      errors: mappedErrors,
    });
  }
};

const updateMeValidator = [check("password").isStrongPassword().withMessage("Please Give Password in Correct format to Confirm Update!")];

module.exports = {
  addUserValidators,
  addUserValidationHandler,
  addRoomValidators,
  addRoomValidationHandler,
  updateMeValidator,
};

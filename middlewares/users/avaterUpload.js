const uploader = require("../../utilities/signleUploader");

function avatarUpload(req, res, next) {
  const upload = uploader("users", ["image/jpeg", "image/jpg", "image/png"], 5000000, "Only .jpg, jpeg or .png format allowed!");
  // call the middleware function
  upload.any()(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
}

function roomlogoUpload(req, res, next) {
  const upload = uploader("rooms", ["image/jpeg", "image/jpg", "image/png"], 5000000, "Only .jpg, jpeg or .png format allowed!");
  // call the middleware function
  upload.any()(req, res, (err) => {
    if (err) {
      // console.log(err);
      res.status(500).json({
        errors: {
          avatar: {
            msg: err.message,
          },
        },
      });
    } else {
      next();
    }
  });
}

module.exports = {
  avatarUpload,
  roomlogoUpload,
};

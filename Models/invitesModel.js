const mongoose = require("mongoose");

const invitesSchema = mongoose.Schema(
  {
    name: {
      type: String,
    },
    photo: {
      type: String,
    },
    roomId: {
      type: mongoose.Schema.ObjectId,
      ref: "Room",
      required: true,
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "People",
      required: true,
    },
  },
  {
    timestamps: Date.now,
  }
);

const Invite = mongoose.model("Invites", invitesSchema);
module.exports = Invite;

const mongoose = require("mongoose");

const roomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    roomCode: {
      type: String,
      required: true,
      trim: true,
    },
    creatorId: {
      type: mongoose.Schema.ObjectId,
      ref: "People",
      required: true,
    },
    participants: {
      type: [mongoose.Schema.ObjectId],
      ref: "People",
    },
    roomlogo: {
      type: String,
      default: "default.jpg",
    },
    updateTime: {
      type: Date,
      default: Date.now,
    },
    slug: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);
const Room = mongoose.model("Room", roomSchema);

module.exports = Room;

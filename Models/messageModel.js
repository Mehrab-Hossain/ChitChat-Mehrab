const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    text: {
      type: String,
    },
    attachment: {
      type: [String],
    },
    senderId: {
      id: mongoose.Schema.ObjectId,
      photo: String,
      name: String,
    },
    roomId: {
      type: mongoose.Schema.ObjectId,
    },
    slug: {
      type: String,
    },
    sendAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// messageSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "senderId",
//     select: "name photo",
//   });

//   next();
// });
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;

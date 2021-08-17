const mongoose = require("mongoose");
const slugify = require("slugify");
const bcrypt = require("bcrypt");

const peopleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    rooms: {
      type: [mongoose.Schema.ObjectId],
      ref: "Room",
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,
    },
    photo: {
      type: String,
      default: "default.jpg",
    },
    slug: {
      type: String,
    },
    lastNotificationCheck: {
      type: Date,
      default: Date.now() - 1000,
    },
    lastNotificationGet: {
      type: Date,
    },
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  }
);

// cheching password modified
peopleSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

peopleSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

//checking password is correct when login
peopleSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

peopleSchema.methods.changedPasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTtimestamp < changedTimestamp;
  }

  //false means not changed
  return false;
};

peopleSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//document middle wire
peopleSchema.pre(/^find/, function (next) {
  this.populate({
    path: "rooms",
    select: "_id updatedAt createdAt name roomlogo slug",
  });
  next();
});

const People = mongoose.model("People", peopleSchema);

module.exports = People;

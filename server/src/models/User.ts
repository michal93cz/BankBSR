import * as bcrypt from "bcrypt-nodejs";
import * as crypto from "crypto";
import * as mongoose from "mongoose";
import { Schema } from "mongoose";

export type UserModel = mongoose.Document & {
  username: string,
  password: string,
  accounts: Schema.Types.ObjectId[],

  comparePassword: (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void
};

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  accounts: [{ type: Schema.Types.ObjectId, ref: "BankAccount" }]
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this;
  if (!user.isModified("password")) { return next(); }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, undefined, (err: mongoose.Error, hash) => {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword: string, cb: (err: any, isMatch: any) => {}) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

const User = mongoose.model("User", userSchema);
export default User;
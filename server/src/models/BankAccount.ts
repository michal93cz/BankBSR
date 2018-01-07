import * as mongoose from "mongoose";

export type BankAccountModel = mongoose.Document & {
  number: string,
  balance: number
};

const bankAccountSchema = new mongoose.Schema({
    number: { type: String, unique: true },
    balance: Number
});

const BankAccount = mongoose.model("User", bankAccountSchema);
export default BankAccount;
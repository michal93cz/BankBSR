import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import * as nrb from "../helpers/nrb";
import * as autoIncrement from "mongoose-auto-increment";
import { authorize } from "fbgraph";

const db = mongoose.connection;
autoIncrement.initialize(db);

export type HistoryEntryModel = {
  operationType: string,
  anotherAccountNumber?: string,
  title?: string,
  amount: number,
  balanceAfter: number,
  date?: Date
};

export type BankAccountModel = mongoose.Document & {
  number?: string,
  balance?: number,
  counter?: number,
  owner: Schema.Types.ObjectId,
  history?: HistoryEntryModel[]
};

const historyEntrySchema = new mongoose.Schema({
  operationType: {
    type: String,
    enum: ["ATM", "BANK", "TRANSFER"]
  },
  anotherAccountNumber: String,
  title: String,
  amount: Number,
  balanceAfter: Number,
  date: { type: Date, default: Date.now }
});

const bankAccountSchema = new mongoose.Schema({
    number: { type: String, unique: true },
    balance: { type: Number, default: 0 },
    counter: Number,
    owner: Schema.Types.ObjectId,
    history: [historyEntrySchema]
});

bankAccountSchema.plugin(autoIncrement.plugin, { model: "BankAccount", field: "counter" });

bankAccountSchema.pre("save", function save(next) {
  const bankAccount = this;
  if (!bankAccount.isModified("counter")) { return next(); }
  nrb.generate(bankAccount.counter, (done: string) => {
    bankAccount.number = done;
    next();
  });
});

const HistoryEntry = mongoose.model("HistoryEntry", historyEntrySchema);
const BankAccount = mongoose.model("BankAccount", bankAccountSchema);

// export HistoryEntry;
export default BankAccount;

import * as mongoose from "mongoose";

export type HistoryEntryModel = {
  operationType: string,
  anotherAccountNumber?: string,
  title?: string,
  amount: number,
  balanceAfter: number,
  date?: Date
};

export type BankAccountModel = mongoose.Document & {
  number: string,
  balance: number,
  history: HistoryEntryModel[]
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
    balance: Number,
    history: [historyEntrySchema]
});

const HistoryEntry = mongoose.model("HistoryEntry", historyEntrySchema);
const BankAccount = mongoose.model("BankAccount", bankAccountSchema);

// export HistoryEntry;
export default BankAccount;

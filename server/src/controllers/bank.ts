import { SoapService, SoapOperation } from "soap-decorators";
import { OperationResult, PaymentInput, WithdrawInput, TransferInput } from "../interfaces/bank";
import { default as BankAccount, BankAccountModel, HistoryEntryModel } from "../models/BankAccount";
import * as SoapHelper from "../helpers/soap";
import * as restBankController from "./restBank";

@SoapService({
  portName: "BankPort",
  serviceName: "BankService"
})
export class BankController {

  @SoapOperation(OperationResult)
  payment(data: PaymentInput, res: (res: OperationResult) => any): void {
    if (data.amount <= 0) SoapHelper.failResponse("Amount should be greater than zero!", res);
    else {
      const promise = BankAccount.findOneAndUpdate(
          { number: data.accountToNumber },
          { $inc: { "balance": data.amount } },
          { new: true }
        ).exec();

      promise.then((doc: BankAccountModel) => {
        const historyEntry: HistoryEntryModel = {
          operationType: "ATM",
          amount: data.amount,
          balanceAfter: doc.get("balance")
        };

        doc.get("history").push(historyEntry);
        return doc.save();
      })
      .then((doc) => SoapHelper.successResponse(doc.balance, res))
      .catch((err) => SoapHelper.failResponse(err.message, res));
    }
  }

  @SoapOperation(OperationResult)
  withdraw(data: WithdrawInput, res: (res: OperationResult) => any): void {
    const promise = BankAccount.findOne({ number: data.accountFromNumber }).exec();

    promise.then((doc: BankAccountModel) => {
      const currentBalance = doc.get("balance") - data.amount;

      if (currentBalance < 0) throw new Error("Lack of account funds!");

      const historyEntry: HistoryEntryModel = {
        operationType: "ATM",
        amount: -data.amount,
        balanceAfter: currentBalance
      };

      doc.balance = currentBalance;
      doc.get("history").push(historyEntry);
      return doc.save();
    })
    .then((doc) => SoapHelper.successResponse(doc.balance, res))
    .catch((err) => SoapHelper.failResponse(err.message, res));
  }

  @SoapOperation(OperationResult)
  transfer(data: TransferInput, res: (res: OperationResult) => any): void {
    restBankController.postOutputTransfer(data)
    .then((reponseBody) => {
      console.log("Data: ");
      console.log(data);
      const promise = BankAccount.findOne({ number: data.source_account }).exec();

      promise.then((doc: BankAccountModel) => {
        console.log(doc);
        const currentBalance = doc.get("balance") - data.amount;

        if (currentBalance < 0) throw new Error("Lack of account funds!");

        const historyEntry: HistoryEntryModel = {
          operationType: "TRANSFER",
          title: data.title,
          amount: -data.amount,
          balanceAfter: currentBalance
        };

        doc.balance = currentBalance;
        doc.get("history").push(historyEntry);
        return doc.save();
      })
      .then((doc) => SoapHelper.successResponse(doc.balance, res))
      .catch((err) => SoapHelper.failResponse(err.message, res));
    })
    .catch((err) => SoapHelper.failResponse(err.message, res));
  }
}
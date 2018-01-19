import { SoapService, SoapOperation } from "soap-decorators";
import { OperationResult, PaymentInput, WithdrawInput, TransferInput, HistoryOutput, HistoryInput } from "../interfaces/bank";
import { default as BankAccount, BankAccountModel, HistoryEntryModel } from "../models/BankAccount";
import * as SoapHelper from "../helpers/soap";
import * as restBankController from "./restBank";
import { Headers, Request } from "request";
import * as auth from "basic-auth";
import { IncomingMessage } from "http";
import User from "../models/User";
import { authorize } from "fbgraph";

@SoapService({
  portName: "BankPort",
  serviceName: "BankService"
})
export class SoapBankController {

  @SoapOperation(OperationResult)
  payment(data: PaymentInput, res: (res: OperationResult) => any, headers: Headers, req: IncomingMessage): void {
    const credentials = auth(req);

    if (data.amount <= 0) SoapHelper.failResponse("Amount should be greater than zero!", res);
    else if (!Number.isInteger(data.amount)) SoapHelper.failResponse("Amount should be integer!", res);
    else {
      const promise = BankAccount.findOne({ number: data.accountToNumber }).populate({ path: "owner", select: "username" }).exec();

      promise.then((doc: BankAccountModel) => {
        if (!doc) throw new Error("Account not found");
        if (doc.owner.username === credentials.name) {
          doc.balance = doc.balance + data.amount;

          const historyEntry: HistoryEntryModel = {
            operationType: "ATM",
            amount: data.amount,
            balanceAfter: doc.balance
          };

          doc.get("history").push(historyEntry);
          return doc.save();
        }
        else throw new Error("Unauthorized");
      })
      .then((doc) => SoapHelper.successResponse(doc.balance, res))
      .catch((err) => SoapHelper.failResponse(err.message, res));
    }
  }

  @SoapOperation(OperationResult)
  withdraw(data: WithdrawInput, res: (res: OperationResult) => any, headers: any, req: IncomingMessage): void {
    const credentials = auth(req);

    if (data.amount <= 0) return SoapHelper.failResponse("Amount should be greater than zero!", res);
    if (!Number.isInteger(data.amount)) return SoapHelper.failResponse("Amount should be integer!", res);

    const promise = BankAccount.findOne({ number: data.accountFromNumber }).populate({ path: "owner", select: "username" }).exec();

    promise.then((doc: BankAccountModel) => {
      if (!doc) throw new Error("Account not found");
      if (doc.owner.username === credentials.name) {
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
      }
      else throw new Error("Unauthorized");
    })
    .then((doc) => SoapHelper.successResponse(doc.balance, res))
    .catch((err) => SoapHelper.failResponse(err.message, res));
  }

  @SoapOperation(OperationResult)
  transfer(data: TransferInput, res: (res: OperationResult) => any, headers: any, req: IncomingMessage): void {
    const credentials = auth(req);

    if (data.amount <= 0) return SoapHelper.failResponse("Amount should be greater than zero!", res);
    if (!data.title) return SoapHelper.failResponse("Title is required!", res);
    if (!data.destination_account) return SoapHelper.failResponse("Account to number is required!", res);
    if (!data.destination_name) return SoapHelper.failResponse("Reciever is required!", res);
    if (!data.source_account) return SoapHelper.failResponse("Account from number is required!", res);
    if (!data.source_name) return SoapHelper.failResponse("Source name is required!", res);
    if (data.source_name.length < 255) return SoapHelper.failResponse("Source name should has less than 255!", res);
    if (data.title.length < 255) return SoapHelper.failResponse("Title should has less than 255!", res);
    if (data.destination_name.length < 255) return SoapHelper.failResponse("Reciever should has less than 255!", res);

    const promise = BankAccount.findOne({ number: data.source_account }).populate({ path: "owner", select: "username" }).exec();

    let bankAccount: BankAccountModel;
    let currentBalance = 0;

    promise.then((doc: BankAccountModel) => {
      if (!doc) throw new Error("Not found source account");
      if (!(doc.owner.username === credentials.name)) throw new Error("Unauthorized");

      currentBalance = doc.get("balance") - data.amount;
      if (currentBalance < 0) throw new Error("Lack of account funds!");

      bankAccount = doc;

      return restBankController.postOutputTransfer(data);
    })
    .then((reponseBody) => {
      const historyEntry: HistoryEntryModel = {
        operationType: "TRANSFER",
        title: data.title,
        amount: -data.amount,
        balanceAfter: currentBalance,
        anotherAccountNumber: data.source_account
      };

      bankAccount.balance = currentBalance;
      bankAccount.get("history").push(historyEntry);
      return bankAccount.save();
    })
    .then((doc) => SoapHelper.successResponse(doc.balance, res))
    .catch((err) => SoapHelper.failResponse(err.message, res));
  }

  @SoapOperation(HistoryOutput)
  history(data: HistoryInput, res: (res: HistoryOutput) => any, headers: any, req: IncomingMessage): void {
    const credentials = auth(req);

    if (!data.accountNumber) return SoapHelper.failResponse("Title is required!", res);

    const promise = BankAccount.findOne({ number: data.accountNumber }).populate({ path: "owner", select: "username" }).exec();

    promise.then((doc: BankAccountModel) => {
      if (!doc) throw new Error("Not found source account");
      if (!(doc.owner.username === credentials.name)) throw new Error("Here Unauthorized");

      res({ status: true, history: doc.history });
    })
    .catch((err) => SoapHelper.failResponse(err.message, res));
  }
}
import { SoapService, SoapOperation } from "soap-decorators";
import { OperationResult, PaymentInput, WithdrawInput, TransferInput, HistoryOutput, HistoryInput, HistoryItem, AccountsOutput, AccountsInput, AccountItem } from "../interfaces/bank";
import { default as BankAccount, BankAccountModel, HistoryEntryModel } from "../models/BankAccount";
import * as SoapHelper from "../helpers/soap";
import * as restBankController from "./restBank";
import { Headers, Request } from "request";
import * as auth from "basic-auth";
import { IncomingMessage } from "http";
import User, { UserModel } from "../models/User";
import { authorize } from "fbgraph";
import * as _ from "lodash";
import { RequestPromise } from "request-promise";

// jest to klasa usługi SOAP oferującej obsługę klienta banku
@SoapService({
  portName: "BankPort",
  serviceName: "BankService"
})
export class SoapBankController {

  // metoda wplacania pieniedzy na konto
  // uzytkownik musi być zautoryzowany oraz być właścicielem konta, aby wykonać te metodę na danym koncie
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

  // metoda wyplacania pieniedzy z konta
  // uzytkownik musi być zautoryzowany oraz być właścicielem konta, aby wykonać te metodę na danym koncie
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

  // metoda przelewania pieniedzy z swojego konta na inne
  // uzytkownik musi być zautoryzowany oraz być właścicielem konta, aby wykonać te metodę na danym koncie
  @SoapOperation(OperationResult)
  transfer(data: TransferInput, res: (res: OperationResult) => any, headers: any, req: IncomingMessage): void {
    const credentials = auth(req);

    if (data.source_account === data.destination_account) return SoapHelper.failResponse("You can`t transfer to the same account", res);
    if (data.amount <= 0) return SoapHelper.failResponse("Amount should be greater than zero!", res);
    if (!data.title) return SoapHelper.failResponse("Title is required!", res);
    if (!data.destination_account) return SoapHelper.failResponse("Account to number is required!", res);
    if (!data.destination_name) return SoapHelper.failResponse("Reciever is required!", res);
    if (!data.source_account) return SoapHelper.failResponse("Account from number is required!", res);
    if (!data.source_name) return SoapHelper.failResponse("Source name is required!", res);
    if (data.source_name.length > 255) return SoapHelper.failResponse("Source name should has less than 255!", res);
    if (data.title.length > 255) return SoapHelper.failResponse("Title should has less than 255!", res);
    if (data.destination_name.length > 255) return SoapHelper.failResponse("Reciever should has less than 255!", res);

    const promise = BankAccount.findOne({ number: data.source_account }).populate({ path: "owner", select: "username" }).exec();

    let bankAccount: BankAccountModel;
    let currentBalance = 0;

    promise.then((doc: BankAccountModel) => {
      if (!doc) throw new Error("Not found source account");
      if (!(doc.owner.username === credentials.name)) throw new Error("Unauthorized");

      currentBalance = doc.get("balance") - data.amount;
      if (currentBalance < 0) throw new Error("Lack of account funds!");

      bankAccount = doc;

      restBankController.postOutputTransfer(data, (promise: RequestPromise) => {
        promise.then((reponseBody) => {
          const historyEntry: HistoryEntryModel = {
            operationType: "TRANSFER",
            title: data.title,
            amount: -data.amount,
            balanceAfter: currentBalance,
            anotherAccountNumber: data.destination_account
          };

          bankAccount.balance = currentBalance;
          bankAccount.get("history").push(historyEntry);
          return bankAccount.save();
        })
        .then((doc) => SoapHelper.successResponse(doc.balance, res))
        .catch((err) => {
          if (err.statusCode === 401) SoapHelper.failResponse(err.error + " bank", res);
          else if (err.statusCode === 400) SoapHelper.failResponse(err.error, res);
          else if (err.statusCode === 404) SoapHelper.failResponse("Account " + err.error, res);
          else if (!err.statusCode) SoapHelper.failResponse(err.message, res);
          else SoapHelper.failResponse(err.error, res);
        });
      });
    })
    .catch((err) => SoapHelper.failResponse(err.message, res));
  }

  // metoda pobierania historii operacji konta
  // uzytkownik musi być zautoryzowany oraz być właścicielem konta, aby wykonać te metodę na danym koncie
  @SoapOperation(HistoryOutput)
  history(data: HistoryInput, res: (res: HistoryOutput) => any, headers: any, req: IncomingMessage): void {
    const credentials = auth(req);

    if (!data.accountNumber) return SoapHelper.failResponse("Account number is required!", res);

    const promise = BankAccount
      .findOne({ number: data.accountNumber })
      .populate({ path: "owner", select: "username -_id" })
      .populate({ path: "history", select: "-_id" })
      .exec();

    promise.then((doc: BankAccountModel) => {
      if (!doc) throw new Error("Not found source account");
      if (!(doc.owner.username === credentials.name)) throw new Error("Unauthorized");

      const history: HistoryItem[] = [];
      doc.history.forEach((item) => {
        history.push({
          operationType: item.operationType,
          amount: item.amount,
          balanceAfter: item.balanceAfter,
          // niestety serializator w bibliotece, którą uzywam do SOAP sie dawał sobie rady z datami
          date: item.date.toString(),
          title: _.escape(item.title),
          anotherAccountNumber: item.anotherAccountNumber
        });
      });

      res({ status: true, history });
    })
    .catch((err) => SoapHelper.failResponse(err.message, res));
  }

  @SoapOperation(AccountsOutput)
  accounts(data: AccountsInput, res: (res: AccountsOutput) => any, headers: any, req: IncomingMessage): void {
    const credentials = auth(req);
    const promise = User.findOne({ username: credentials.name })
        .populate({ path: "accounts", select: "number -_id" })
        .exec();

    promise.then((user: UserModel) => {
        if (!user) throw new Error("Not found");
        const accounts = _.map(user.accounts, (account) => _.pick(account, ["number"]));
        res({ status: true, accounts: accounts as AccountItem[] });
    })
    .catch((err) => SoapHelper.failResponse(err.message, res));
  }
}

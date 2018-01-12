import { Request, Response } from "express";
import * as fs from "fs";
import * as auth from "basic-auth";
import * as rp from "request-promise";
import BankAccount, { BankAccountModel, HistoryEntryModel } from "../models/BankAccount";
import { TransferInput } from "../interfaces/bank";
import * as _ from "lodash";

export let postInputTransfer = (req: Request, res: Response) => {
    // const authConfig = JSON.parse(fs.readFileSync("../authConfig.json", "utf8"));

    const credentials = auth(req);
    console.log(credentials);
    if (!credentials || credentials.name !== "admin" || credentials.pass !== "admin") {
        res.status(401).send();
    }
    else if (req.body.amount <= 0) res.status(400).send();
    else {
      const promise = BankAccount.findOneAndUpdate(
          { number: req.params.accountNumber },
          { $inc: { "balance": req.body.amount} },
          { new: true }
        ).exec();

      promise.then((doc: BankAccountModel) => {
        const historyEntry: HistoryEntryModel = {
            operationType: "TRANSFER",
            anotherAccountNumber: req.body.source_account,
            title: req.body.title,
            amount: req.body.amount,
            balanceAfter: doc.get("balance")
        };

        doc.get("history").push(historyEntry);
        return doc.save();
      })
      .then((doc) => res.status(201).send())
      .catch((err) => res.status(404).send());
    }
};

export let postOutputTransfer = (data: TransferInput) => {
    // const accountToNumber = data.destination_account;
    const accountToNumber = "372367";
    const bankUri = "http://admin:admin@localhost:3000";
    const uri = bankUri + "/accounts/" + accountToNumber + "/history";
    const options = {
        method: "POST",
        body: _.omit(data, ["destination_account"]),
        json: true
    };

    return rp(uri, options);
};
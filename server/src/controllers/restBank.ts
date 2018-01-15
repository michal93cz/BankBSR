import { Request, Response } from "express";
import * as fs from "fs";
import * as auth from "basic-auth";
import * as rp from "request-promise";
import BankAccount, { BankAccountModel, HistoryEntryModel } from "../models/BankAccount";
import { TransferInput } from "../interfaces/bank";
import * as _ from "lodash";
import User, { UserModel } from "../models/User";

const authConfig = {
    username: process.env.TRANSFER_USERNAME,
    password: process.env.TRANSFER_PASSWORD
};

export let postInputTransfer = (req: Request, res: Response) => {
    const credentials = auth(req);

    if (!credentials || credentials.name !== authConfig.username || credentials.pass !== authConfig.password) {
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
      .catch((err) => res.status(404).send(err.message));
    }
};

export let postOutputTransfer = (data: TransferInput) => {
    const accountToNumber = data.destination_account;
    const bankUri = "http://" + authConfig.username + ":" + authConfig.password + "@localhost:3000";
    const uri = bankUri + "/accounts/" + accountToNumber + "/history";
    const options = {
        method: "POST",
        body: _.omit(data, ["destination_account"]),
        json: true
    };

    return rp(uri, options);
};

export let newAccount = (req: Request, res: Response) => {
    const credentials = auth(req);
    User.findOne({ username: credentials.name }, (err, user: UserModel) => {
        if (err) return res.status(401).send();

        user.comparePassword(credentials.pass, (err, isMatch) => {
            if (err) return res.status(401).send();

            BankAccount.create({ owner: user._id }, (err: any, account: any) => {
                if (err) return res.status(500).json(err);

                user.update({$push: {accounts: account._id}}, (err, done) => {
                    if (err) return res.status(500).json(err);
                    return res.status(201).json({ accountNumber: account.number });
                });
            });
        });
    });
};

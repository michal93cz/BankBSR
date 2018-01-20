import { Request, Response } from "express";
import * as fs from "fs";
import * as auth from "basic-auth";
import * as rp from "request-promise";
import BankAccount, { BankAccountModel, HistoryEntryModel } from "../models/BankAccount";
import { TransferInput } from "../interfaces/bank";
import * as _ from "lodash";
import * as csv from "fast-csv";
import * as path from "path";
import User, { UserModel } from "../models/User";
import * as nrb from "../helpers/nrb";
import { RequestPromise } from "request-promise";

const authInputConfig = {
    username: process.env.TRANSFER_USERNAME,
    password: process.env.TRANSFER_PASSWORD
};

const authOutputConfig = {
    username: process.env.TRANSFER_USERNAME,
    password: process.env.TRANSFER_PASSWORD
};

// metoda REST pozwalająca bankowi zewnętrznemu na wykonanie przelewu na konto w banku wewnetrznym
export let postInputTransfer = (req: Request, res: Response) => {
    const credentials = auth(req);

    if (!credentials || credentials.name !== authInputConfig.username || credentials.pass !== authInputConfig.password) {
        res.status(401).send("Unauthorized bank");
    }
    else if (req.body.amount <= 0 || !Number.isInteger(req.body.amount)) res.status(400).send("Not valid amount");
    else if (req.body.title.length > 255) res.status(400).send("Not valid title");
    else if (req.body.source_name.length > 255) res.status(400).send("Not valid source_name");
    else if (req.body.destination_name.length > 255) res.status(400).send("Not valid destination_name");
    else {
      const promise = BankAccount.findOne(
          { number: req.params.accountNumber }).exec();

      promise.then((doc: BankAccountModel) => {
        if (!doc) throw new Error("Account not found");
        doc.balance = doc.balance + req.body.amount;
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

// metoda REST wykonania przelewu do zewnętrznego banku
// na podstawie numeru banku z numeru konta pobierane jest z pliku csv adres banku do którego transferowane są pieniądze
// metoda zwraca obiekt Promise, który wykonywany jest w metodzie interfejsu SOAP banku
export let postOutputTransfer = (data: TransferInput, callback: (promise: RequestPromise) => any) => {
    const accountToNumber = data.destination_account;
    const bankNumber = accountToNumber.substring(2, 10);
    let bankEndpoint = "http://localhost:8081";

    const csvPath = path.resolve(path.join(__dirname, "../../../banks.csv"));
    const stream = fs.createReadStream(csvPath);
    const csvStream = csv()
        .on("data", (data: Array<string>) => {
            if (data[0] === bankNumber) bankEndpoint = data[1];
        })
        .on("end", () => {
            bankEndpoint = bankEndpoint.substring(7, bankEndpoint.length);
            const bankUri = "http://" + authOutputConfig.username + ":" + authOutputConfig.password + "@" + bankEndpoint;
            const uri = bankUri + "/accounts/" + accountToNumber + "/history";
            const options = {
                method: "POST",
                body: _.omit(data, ["destination_account"]),
                json: true
            };

            callback(rp(uri, options));
        });
    stream.pipe(csvStream);
};

// metoda REST tworzenia nowego konta dla uzytkownika
// uzytkownik musi być zautoryzowany oraz być właścicielem konta
export let newAccount = (req: Request, res: Response) => {
    const credentials = auth(req);
    User.findOne({ username: credentials.name }, (err, user: UserModel) => {
        if (err) return res.status(404).send();

        if (user) BankAccount.create({ owner: user._id }, (err: any, account: any) => {
            if (err) return res.status(500).json(err);

            user.update({$push: {accounts: account._id}}, (err, done) => {
                if (err) return res.status(500).json(err);
                return res.status(201).json({ accountNumber: account.number });
            });
        });
        else return res.status(404).send();
    });
};

// metoda REST pobierania wszystkich kont uzytkownika
// uzytkownik musi być zautoryzowany oraz być właścicielem konta
export let getAccounts = (req: Request, res: Response) => {
    const credentials = auth(req);
    const promise = User.findOne({ username: credentials.name })
        .populate({ path: "accounts", select: "number -_id" })
        .exec();

    promise.then((user: UserModel) => {
        if (!user) throw new Error("Not found");
        res.json(user.get("accounts"));
    })
    .catch((err) => {
        res.status(404).send();
    });
};

// metoda pobierania historii operacji konta
// uzytkownik musi być zautoryzowany oraz być właścicielem konta, aby wykonać tę metodę na danym koncie
export let getHistory = (req: Request, res: Response) => {
    const credentials = auth(req);

    if (!req.params.accountNumber) return res.status(400).send("Account number required!");

    const promise = BankAccount.findOne({ number: req.params.accountNumber }).populate({ path: "owner", select: "username" }).exec();

    promise.then((doc: BankAccountModel) => {
      if (!doc) res.status(404).send();
      if (!(doc.owner.username === credentials.name)) res.status(401).send();

      res.json(doc.history);
    })
    .catch((err) => res.send(err));
};

import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as bodyParser from "body-parser";
import * as logger from "morgan";
import * as lusca from "lusca";
import * as dotenv from "dotenv";
import * as mongo from "connect-mongo";
import * as flash from "express-flash";
import * as path from "path";
import * as mongoose from "mongoose";
import * as expressValidator from "express-validator";
import * as bluebird from "bluebird";
import { soap, createWsdl } from "soap-decorators";
import * as auth from "basic-auth";
import * as bcrypt from "bcrypt-nodejs";

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import { SoapBankController } from "./controllers/soapBank";
import * as restBankController from "./controllers/restBank";
import { UserModel } from "./models/User";
import User from "./models/User";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = process.env.MONGOLAB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, {useMongoClient: true}).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

const soapBankController = new SoapBankController();

app.all("/soap/bank", (req, res, next) => {
  const credentials = auth(req);
  const promise = User.findOne({ username: credentials.name }).exec();

  promise.then((doc: UserModel) => {
    bcrypt.compare(credentials.pass, doc.password, (err: mongoose.Error, isMatch: boolean) => {
      if (err) res.status(401).send();
      else isMatch ? next() : res.status(401).send();
    });
  })
  .catch((err: any) => {
    res.status(401).send();
  });
});
app.use("/soap/bank", soap(soapBankController));

app.post("/accounts/:accountNumber/history", restBankController.postInputTransfer);

app.all("/api/accounts", (req, res, next) => {
  const credentials = auth(req);
  const promise = User.findOne({ username: credentials.name }).exec();

  promise.then((doc: UserModel) => {
    bcrypt.compare(credentials.pass, doc.password, (err: mongoose.Error, isMatch: boolean) => {
      if (err) res.status(401).send();
      else isMatch ? next() : res.status(401).send();
    });
  })
  .catch((err: any) => {
    res.status(401).send();
  });
});
app.post("/api/accounts", restBankController.newAccount);
app.get("/api/accounts", restBankController.getAccounts);
app.get("/api/accounts/:accountNumber/history", restBankController.getHistory);

module.exports = app;

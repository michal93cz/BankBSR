import * as express from "express";
import * as compression from "compression";  // compresses requests
import * as session from "express-session";
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

const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import * as userController from "./controllers/user";
import { BankController } from "./controllers/bank";
import * as restBankController from "./controllers/restBank";

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
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));

app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));

const bankController = new BankController();

/**
 * Primary app routes.
 */
app.use("/soap/bank", soap(bankController));

app.post("/accounts/:accountNumber/history", restBankController.postInputTransfer);
app.post("/login", userController.postLogin);
app.get("/logout", userController.logout);

module.exports = app;

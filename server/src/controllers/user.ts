import { default as User, UserModel } from "../models/User";
import { Request, Response, NextFunction } from "express";
const request = require("express-validator");

/**
 * POST /login
 * Sign in using email and password.
 */
export let postLogin = (req: Request, res: Response, next: NextFunction) => {
  req.assert("email", "Email is not valid").isEmail();
  req.assert("password", "Password cannot be blank").notEmpty();
  req.sanitize("email").normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash("errors", errors);
    return res.redirect("/login");
  }
};

/**
 * GET /logout
 * Log out.
 */
export let logout = (req: Request, res: Response) => {
  req.logout();
  res.redirect("/");
};

/**
 * GET /logout
 * Log out.
 */
export let newUser = (req: Request, res: Response) => {
  req.logout();
  res.redirect("/");
};
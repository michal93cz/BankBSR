import { BankAccountModel } from "../models/BankAccount";
import { OperationResult, HistoryOutput } from "../interfaces/bank";

export let successResponse = (currentBalance: number, res: (res: OperationResult) => any): void => {
    res({ status: true, currentBalance });
};

export let failResponse = (message: string, res: (res: OperationResult | HistoryOutput) => any): void => {
    res({ status: false, message });
};

// export let isAccountOwner = (username: string, number: string): boolean => {
//     // const promise = User.findOne({ username }).populate({ path: "accounts", select: "number" }).exec();

//     // promise.then((user: UserModel) => {
//     //     if (!user) throw new Error();
//     //     res.json(user.get("accounts"));
//     // })
//     // .catch(() => {
//     //     return false;
//     // });
//     // return true;
// };
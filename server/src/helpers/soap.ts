import { BankAccountModel } from "../models/BankAccount";
import { OperationResult } from "../interfaces/bank";

export let successResponse = (currentBalance: number, res: (res: OperationResult) => any): void => {
    res({ status: true, currentBalance });
};

export let failResponse = (message: string, res: (res: OperationResult) => any): void => {
    res({ status: false, message });
};

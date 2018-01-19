import { BankAccountModel } from "../models/BankAccount";
import { OperationResult, HistoryOutput } from "../interfaces/bank";

// metoda wysyłająca odpowiedź w przypadku powodzenia operacji SOAP
// status ustawiony na TRUE oznacza powodzenie, pole currentBalance zawiera zaktualizowany stan konta
export let successResponse = (currentBalance: number, res: (res: OperationResult) => any): void => {
    res({ status: true, currentBalance });
};

// metoda wysyłająca odpowiedź w przypadku niepowodzenia operacji SOAP
// status ustawiony na FALSE oznacza niepowodzenie, pole message zawiera szczegóły o niepowodzeniu
export let failResponse = (message: string, res: (res: OperationResult | HistoryOutput) => any): void => {
    res({ status: false, message });
};

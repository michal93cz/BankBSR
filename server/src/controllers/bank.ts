import { SoapService, SoapOperation } from "soap-decorators";
import { OperationResult, PaymentInput, WithdrawInput } from "../interfaces/bank";

@SoapService({
  portName: "BankPort",
  serviceName: "BankService"
})
export class BankController {

  @SoapOperation(OperationResult)
  payment(data: PaymentInput, res: (res: OperationResult) => any): void {

    res({
        status: "OK",
        currentBalance: 100
    });
  }

  @SoapOperation(OperationResult)
  withdraw(data: WithdrawInput, res: (res: OperationResult) => any): void {

    res({
        status: "OK",
        currentBalance: 100
    });
  }
}
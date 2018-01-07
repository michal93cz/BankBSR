import { XSDComplexType, XSDElement } from "soap-decorators";

@XSDComplexType
export class TransferInput {

  @XSDElement
  accountFromNumber: string;

  @XSDElement
  accountToNumber: string;

  @XSDElement
  title: string;

  @XSDElement
  amount: number;
}

@XSDComplexType
export class PaymentInput {

  @XSDElement
  accountToNumber: string;

  @XSDElement
  amount: number;
}

@XSDComplexType
export class WithdrawInput {

  @XSDElement
  accountFromNumber: string;

  @XSDElement
  amount: number;
}

@XSDComplexType
export class OperationResult {

  @XSDElement
  status: string;

  @XSDElement
  currentBalance: number;
}

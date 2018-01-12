import { XSDComplexType, XSDElement } from "soap-decorators";

@XSDComplexType
export class TransferInput {

  @XSDElement
  source_account: string;

  @XSDElement
  destination_account: string;

  @XSDElement
  title: string;

  @XSDElement
  amount: number;

  @XSDElement
  source_name: string;

  @XSDElement
  destination_name: string;
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
  status: boolean;

  @XSDElement
  message?: string;

  @XSDElement
  currentBalance?: number;
}

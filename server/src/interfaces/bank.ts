import { XSDComplexType, XSDElement } from "soap-decorators";

// klasa uzywana do danych wejściowych metody przelewu bankowego
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

// klasa uzywana do danych wejściowych metody wpłaty pieniędzy na konto
@XSDComplexType
export class PaymentInput {

  @XSDElement
  accountToNumber: string;

  @XSDElement
  amount: number;
}

// klasa uzywana do danych wejściowych metody wypłaty pieniędzy z konta
@XSDComplexType
export class WithdrawInput {

  @XSDElement
  accountFromNumber: string;

  @XSDElement
  amount: number;
}

// generyczna klasa uzywana do informowania klienta o powodzeniu/niepowodzeniu operacji
// zawiera równiez pole, w którym znajdują się szczegóły niepowodzenia lub zaktulizowany stan konta
@XSDComplexType
export class OperationResult {

  @XSDElement
  status: boolean;

  @XSDElement
  message?: string;

  @XSDElement
  currentBalance?: number;
}

// klasa uzywana do danych wejściowych metody pobierającej historie danego konta
@XSDComplexType
export class HistoryInput {

  @XSDElement
  accountNumber: string;
}

// klasa reprezentująca jeden zapis w historii konta
@XSDComplexType
export class HistoryItem {

  @XSDElement
  operationType: string;

  @XSDElement
  anotherAccountNumber?: string;

  @XSDElement
  title?: string;

  @XSDElement
  amount: number;

  @XSDElement
  balanceAfter: number;

  @XSDElement
  date?: string;
}

// klasa uzywana w odpowiedzi na operacje pobierania historii danego konta
@XSDComplexType
export class HistoryOutput {

  @XSDElement
  status: boolean;

  @XSDElement({
    type: HistoryItem
  })
  history: HistoryItem[];
}

// klasa uzywana do pobierania listy kont uzytkownika
@XSDComplexType
export class AccountsInput {

  @XSDElement
  username: string;
}

// klasa reprezentujaca jedno konto bankowe
@XSDComplexType
export class AccountItem {

  @XSDElement
  number: string;
}

// klasa uzywana w odpowiedzi na zapytanie o liste kont uzytkownika
@XSDComplexType
export class AccountsOutput {

  @XSDElement
  status: boolean;

  @XSDElement({
    type: AccountItem
  })
  accounts: AccountItem[];
}

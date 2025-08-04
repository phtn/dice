export interface Balance {
  currencyCode: string;
  fractionalDigits: number;
  amount: number;
}

export interface UserAccount {
  id: string;
  balance: Balance;
}

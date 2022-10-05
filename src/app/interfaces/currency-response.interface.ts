import { ICurrency } from './currency.interface';

export interface ICurrencyReponse {
  Date: Date;
  PreviousDate: Date;
  PreviousURL: string;
  Timestamp: Date;
  Valute: Record<string, ICurrency>;
}

import { ICurrencyReponse } from '@interfaces';
import { Observable } from 'rxjs';

export interface LoadingStrategy {
  get name(): string;
  load(): Observable<ICurrencyReponse>;
}

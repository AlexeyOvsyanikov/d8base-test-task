import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICurrencyReponse } from '@interfaces';
import { Observable } from 'rxjs';

import { LoadingStrategy } from './base.strategy';

@Injectable({
  providedIn: 'root',
})
export class JSONLoadingStrategy implements LoadingStrategy {
  public get name() {
    return 'JSONLoadingStrategy';
  }

  constructor(private readonly _http: HttpClient) {}

  load(): Observable<ICurrencyReponse> {
    return this._http.get<ICurrencyReponse>('/json');
  }
}

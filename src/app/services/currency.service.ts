import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, INJECTOR } from '@angular/core';
import { Observable } from 'rxjs';

import { ICurrencyReponse } from '@interfaces';

import {
  LoadingStrategy,
  JSONLoadingStrategy,
  XMLLoadingStrategy,
} from './strategies/base.strategy';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {
  private _strategy!: LoadingStrategy;

  public get strategy(): LoadingStrategy {
    return this._strategy;
  }

  public set strategy(strategy: LoadingStrategy) {
    this._strategy = strategy;
  }

  constructor(private readonly _http: HttpClient, private readonly _injector: Injector) {
    this._strategy = this._injector.get<JSONLoadingStrategy>(JSONLoadingStrategy);
  }

  public list(): Observable<Partial<ICurrencyReponse>> {
    return this._strategy.load();
  }
}

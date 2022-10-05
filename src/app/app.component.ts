import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  finalize,
  interval,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

import { CurrencyService } from '@services';

import { ICurrency } from './interfaces/currency.interface';
import { JSONLoadingStrategy, XMLLoadingStrategy } from './services/strategies/base.strategy';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private readonly _currencies$ = new BehaviorSubject<ICurrency[]>([]);
  private readonly _currency$ = new BehaviorSubject<ICurrency | undefined>(undefined);
  private readonly _strategies$ = new BehaviorSubject<string[]>(['XML', 'JSON']);

  public get currencies$(): Observable<ICurrency[]> {
    return this._currencies$.asObservable();
  }

  public get currency$(): Observable<ICurrency | undefined> {
    return this._currency$.asObservable();
  }

  public get strategies$(): Observable<string[]> {
    return this._strategies$.asObservable();
  }

  public form!: FormGroup;

  constructor(
    private readonly _snackbarService: MatSnackBar,
    private readonly _http: HttpClient,
    private readonly _formBuilder: FormBuilder,
    private readonly _currencyService: CurrencyService
  ) {}

  public ngOnInit(): void {
    this._createForm();
    this._initRequest();
  }

  public trackCurrency(index: number, currency: ICurrency): string {
    return currency.ID;
  }

  private _createForm(): void {
    this.form = this._formBuilder.group({
      currency: [],
      strategy: ['JSON'],
    });

    this._onValueChanges();
  }

  private _onValueChanges(): void {
    this.form.controls['currency'].valueChanges
      .pipe(
        distinctUntilChanged((prev, current) => prev.ID === current.ID),
        tap((currency) => {
          this._currency$.next(currency);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private _initRequest(): void {
    this._currencyService
      .list()
      .pipe(
        tap((response) => {
          this.form.patchValue({
            currency: response.Valute && response.Valute['EUR'],
          });

          this._currencies$.next(Object.values(response.Valute ?? {}));
        }),
        catchError((err) => {
          this._showErrorMessage();
          this._changeStrategy();
          return of(err);
        }),
        finalize(() => {
          this._startWatch();
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private _startWatch(): void {
    this._currencyService.strategy = new XMLLoadingStrategy(this._http);

    interval(3000)
      .pipe(
        switchMap((tick) => {
          return this._currencyService.list().pipe(
            tap((response) => {
              if (tick % 3 === 0) {
                throw new Error();
              }

              this._currencies$.next(Object.values(response.Valute ?? {}));
            }),
            catchError((err) => {
              this._changeStrategy();
              this._showErrorMessage();

              return of(err);
            }),
            untilDestroyed(this)
          );
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  private _changeStrategy(): void {
    let strategy = '';

    if (this._currencyService.strategy.name === 'JSONLoadingStrategy') {
      strategy = 'XML';
      this._currencyService.strategy = new XMLLoadingStrategy(this._http);
    } else {
      strategy = 'JSON';
      this._currencyService.strategy = new JSONLoadingStrategy(this._http);
    }

    this.form.patchValue({
      strategy,
    });
  }

  private _showErrorMessage(): void {
    this._snackbarService.open(
      'Failed to load currencies. Try to use another source. Please wait...',
      'Close',
      {
        duration: 4000,
      }
    );
  }
}

import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { XmlParser } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { ICurrencyReponse } from '@interfaces';
import { catchError, Observable, of, tap } from 'rxjs';

export interface LoadingStrategy {
  get name(): string;
  load(): Observable<ICurrencyReponse>;
}

@Injectable({
  providedIn: 'root',
})
export class JSONLoadingStrategy implements LoadingStrategy {
  public get name() {
    return 'JSONLoadingStrategy';
  }

  constructor(private readonly _http: HttpClient) {}

  load(): Observable<ICurrencyReponse> {
    return this._http.get<ICurrencyReponse>('https://www.cbr-xml-daily.ru/daily_json.js');
  }
}

@Injectable({
  providedIn: 'root',
})
export class XMLLoadingStrategy implements LoadingStrategy {
  public get name() {
    return 'XMLLoadingStrategy';
  }

  constructor(private readonly _http: HttpClient) {}

  load(): Observable<ICurrencyReponse> {
    return this._http.get<ICurrencyReponse>('https://www.cbr-xml-daily.ru/daily_utf8.xml').pipe(
      catchError((err: any) => {
        const response: ICurrencyReponse = {
          Date: new Date(),
          PreviousDate: new Date(),
          PreviousURL: '',
          Timestamp: new Date(),
          Valute: {},
        };

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(err.error.text, 'text/xml');
        const valutesNodes = xmlDoc.querySelectorAll('Valute');

        valutesNodes.forEach((node) => {
          const ID = node.attributes.getNamedItem('ID')?.nodeValue ?? '';
          const NumCode = node.querySelector('NumCode');
          const CharCode = node.querySelector('CharCode');
          const Nominal = node.querySelector('Nominal');
          const Name = node.querySelector('Name');
          const Value = node.querySelector('Value');

          if (response.Valute) {
            const key = CharCode?.innerHTML ?? '';

            response.Valute[key] = {
              ID,
              NumCode: NumCode?.innerHTML ?? '',
              CharCode: CharCode?.innerHTML ?? '',
              Nominal: Number(Nominal?.innerHTML ?? ''),
              Name: Name?.innerHTML ?? '',
              Value: Number(Value?.innerHTML?.replace(',', '.') ?? '0'),
              Previous: 0,
            };
          }
        });

        return of(response);
      })
    );
  }
}

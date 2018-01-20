import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SOAPService, Client } from 'ngx-soap';
import { AuthService } from './auth.service';

@Injectable()
export class AccountsService {
  private client: Client;
  private jsonResponse: any;
  private xmlResponse: string;

  constructor(
    private http: HttpClient,
    private soap: SOAPService,
    private authService: AuthService
  ) { }

  getAccounts() {
    this.client.operation('accounts', { username: 'whatever' })
      .then(operation => {
        if (operation.error) { return operation.error; }
        const url = operation.url.replace('http://localhost:4200', '/soap/bank');

        return this.http.post(url, operation.xml, { headers: this.authService.getAuthHeaders(operation.headers), responseType: 'text' })
          .map(response => {
            this.xmlResponse = response.toString();
            this.jsonResponse = this.client.parseResponseBody(response.toString());
            return this.jsonResponse.Body;
          });
      })
      .catch(err => err);
  }
}

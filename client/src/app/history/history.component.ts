import { Component, OnInit } from '@angular/core';
import { SOAPService, Client } from 'ngx-soap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  public choosenAccount = '';
  public accountsList;
  public choosenHistory;
  public error = '';
  private client: Client;
  private jsonResponse: any;
  private xmlResponse: string;
  private message;

  constructor(
    private http: HttpClient,
    private soap: SOAPService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.error = '';

    this.http.get('/api/accounts', { headers: this.authService.getAuthHeaders(), responseType: 'json' })
      .subscribe((response: any) => this.accountsList = response);

    this.http.get('/soap/bank?WSDL', { headers: this.authService.getAuthHeaders(), responseType: 'text' })
      .subscribe(response => {
        if (response) {
          this.soap.createClient(response).then((client: Client) => {
            this.client = client;
          });
      }
    });
  }

  getHistory() {
    this.client.operation('history', { accountNumber: this.choosenAccount })
      .then(operation => {
        if (operation.error) {
          this.error = 'Here Internal error';
          return;
        }
        const url = operation.url.replace('http://localhost:4200', '/soap/bank');

        this.http.post(url, operation.xml, { headers: this.authService.getAuthHeaders(operation.headers), responseType: 'text' })
          .subscribe(
            response => {
              this.xmlResponse = response.toString();
              this.jsonResponse = this.client.parseResponseBody(response.toString());
              console.log(this.jsonResponse);
              if (this.jsonResponse.Body.HistoryOutput.status) {
                this.message = this.jsonResponse.Body.HistoryOutput.history;
                this.error = '';
              } else {
                this.error = this.jsonResponse.Body.HistoryOutput.message;
                this.message = '';
              }
            },
            err => {
              this.error = 'Internal error';
            }
        );
      })
      .catch(err => this.error = 'Internal error');
  }

  getHistoryRest() {
    this.http.get('/api/accounts/' + this.choosenAccount + '/history', { headers: this.authService.getAuthHeaders(), responseType: 'json' })
      .subscribe((response: any) => this.message = response);
  }

  getAccounts() {
    this.client.operation('accounts', { username: 'michu' })
      .then(operation => {
        if (operation.error) {
          this.error = 'Here Internal error';
          return;
        }
        const url = operation.url.replace('http://localhost:4200', '/soap/bank');

        this.http.post(url, operation.xml, { headers: this.authService.getAuthHeaders(operation.headers), responseType: 'text' })
          .subscribe(
            response => {
              this.xmlResponse = response.toString();
              this.jsonResponse = this.client.parseResponseBody(response.toString());
              console.log(this.jsonResponse);
              if (this.jsonResponse.Body.AccountsOutput.status) {
                console.log(this.jsonResponse.Body);
                this.error = '';
              } else {
                console.log('Error: ', this.jsonResponse.Body);
              }
            },
            err => {
              this.error = 'Internal error';
            }
        );
      })
      .catch(err => this.error = 'Internal error');
  }
}

import { Component, OnInit } from '@angular/core';
import { SOAPService, Client } from 'ngx-soap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-atm',
  templateUrl: './atm.component.html',
  styleUrls: ['./atm.component.css']
})
export class AtmComponent implements OnInit {
  public formPayment = {
    accountToNumber: '',
    amount: 0
  };
  public formWithdraw = {
    accountFromNumber: '',
    amount: 0
  };
  public accountsList;
  public paymentError = '';
  public withdrawError = '';
  public paymentMessage = '';
  public withdrawMessage = '';
  private client: Client;
  private jsonResponse: any;
  private xmlResponse: string;

  constructor(
    private http: HttpClient,
    private soap: SOAPService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.paymentError = '';
    this.withdrawError = '';
    this.paymentMessage = '';
    this.withdrawMessage = '';

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

  payment() {
    this.formPayment.amount = Math.floor(this.formPayment.amount * 100);
    this.client.operation('payment', this.formPayment)
      .then(operation => {
        if (operation.error) {
          this.paymentError = 'Internal error';
          return;
        }
        const url = operation.url.replace('http://localhost:4200', '/soap/bank');

        this.http.post(url, operation.xml, { headers: this.authService.getAuthHeaders(operation.headers), responseType: 'text' })
          .subscribe(
            response => {
              this.xmlResponse = response.toString();
              this.jsonResponse = this.client.parseResponseBody(response.toString());
              console.log(this.jsonResponse);
              if (this.jsonResponse.Body.OperationResult.status) {
                this.paymentMessage = this.jsonResponse.Body.OperationResult.currentBalance;
                this.paymentError = '';
              } else {
                this.paymentError = this.jsonResponse.Body.OperationResult.message;
                this.paymentMessage = '';
              }

              this.formPayment.amount = 0;
            },
            err => {
              this.paymentError = 'Internal error';

              this.formPayment.amount = 0;
            }
        );
      })
      .catch(err => {
        this.paymentError = 'Internal error';
        this.formPayment.amount = 0;
      });
  }

  withdraw() {
    this.formWithdraw.amount = Math.floor(this.formWithdraw.amount * 100);
    this.client.operation('withdraw', this.formWithdraw)
      .then(operation => {
        if (operation.error) {
          this.withdrawError = 'Internal error';
          return;
        }
        const url = operation.url.replace('http://localhost:4200', '/soap/bank');

        this.http.post(url, operation.xml, { headers: this.authService.getAuthHeaders(operation.headers), responseType: 'text' })
          .subscribe(
            response => {
              this.xmlResponse = response.toString();
              this.jsonResponse = this.client.parseResponseBody(response.toString());
              console.log(this.jsonResponse);
              if (this.jsonResponse.Body.OperationResult.status) {
                this.withdrawMessage = this.jsonResponse.Body.OperationResult.currentBalance;
                this.withdrawError = '';
              } else {
                this.withdrawError = this.jsonResponse.Body.OperationResult.message;
                this.withdrawMessage = '';
              }
              this.formWithdraw.amount = 0;
            },
            err => {
              this.withdrawError = 'Internal error';
              this.formWithdraw.amount = 0;
            }
        );
      })
      .catch(err => {
        this.withdrawError = 'Internal error';
        this.formWithdraw.amount = 0;
      });
  }
}

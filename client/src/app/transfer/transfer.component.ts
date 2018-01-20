import { Component, OnInit } from '@angular/core';
import { SOAPService, Client } from 'ngx-soap';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
  public formModel = {
    source_account: '',
    destination_account: '',
    title: '',
    amount: 0,
    source_name: '',
    destination_name: ''
  };
  public accountsList;
  public error = '';
  private client: Client;
  private jsonResponse: any;
  private xmlResponse: string;
  private message: string;

  constructor(
    private http: HttpClient,
    private soap: SOAPService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.message = '';
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

  transfer() {
    this.formModel.amount = Math.floor(this.formModel.amount * 100);
    this.client.operation('transfer', this.formModel)
      .then(operation => {
        if (operation.error) {
          this.error = 'Internal error';
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
                this.message = this.jsonResponse.Body.OperationResult.currentBalance;
                this.error = '';
              } else {
                this.error = this.jsonResponse.Body.OperationResult.message;
                this.message = '';
              }

              this.formModel.amount = 0;
            },
            err => {
              this.error = 'Internal error';
              this.formModel.amount = 0;
            }
        );
      })
      .catch(err => {
        this.error = 'Internal error';
        this.formModel.amount = 0;
      });
  }
}

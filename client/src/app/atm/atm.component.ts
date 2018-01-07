import { Component, OnInit } from '@angular/core';
import { SOAPService, Client } from 'ngx-soap';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-atm',
  templateUrl: './atm.component.html',
  styleUrls: ['./atm.component.css']
})
export class AtmComponent implements OnInit {
  private client: Client;
  private jsonResponse: any;
  private xmlResponse: string;
  private message: string;

  constructor(
    private http: HttpClient,
    private soap: SOAPService
  ) { }

  ngOnInit() {
    this.message = '';

    this.http.get('/soap/bank?WSDL', { responseType: 'text' })
      .subscribe(response => {
        if (response) {
          console.log(response);

          this.soap.createClient(response).then((client: Client) => {
            this.client = client;
          });
      }
    });
  }

  withdraw() {
    const body  = {
      accountFromNumber: '2314562134354657653',
      amount: 10
    };

    this.client.operation('withdraw', body)
      .then(operation => {
        if (operation.error) {
          console.log('Operation error', operation.error);
          return;
        }

        const url = operation.url.replace('http://localhost:4200', '/soap/bank');
        this.http.post(url, operation.xml, { headers: operation.headers, responseType: 'text' })
          .subscribe(
            response => {
              this.xmlResponse = response.toString();
              this.jsonResponse = this.client.parseResponseBody(response.toString());
              try {
                console.log(this.jsonResponse);
                this.message = this.jsonResponse.Body.OperationResult.currentBalance;
              } catch (error) { }
            },
            err => {
              console.log('Error calling ws', err);
            }
        );
      })
      .catch(err => console.log('Error', err));
  }

}

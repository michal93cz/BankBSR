import { Component, OnInit } from '@angular/core';
import { SOAPService, Client } from 'ngx-soap';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent implements OnInit {
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

  transfer() {
    const body  = {
      source_account: '2345346',
      destination_account: '372367',
      title: 'title1',
      amount: 50,
      source_name: 'cos',
      destination_name: 'cos2'
    };

    this.client.operation('transfer', body)
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

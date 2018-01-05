import { Component, OnInit } from '@angular/core';
import { SOAPService, Client } from 'ngx-soap';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
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

    this.http.get('http://www.dneonline.com/calculator.asmx?WSDL', { responseType: 'text' })
      .subscribe(response => {
        if (response) {
          this.soap.createClient(response).then((client: Client) => {
            this.client = client;
          });
      }
    });
  }

  sum() {
    const body  = {
      intA: 4,
      intB: 4
    };

    this.client.operation('Add', body)
      .then(operation => {
        if (operation.error) {
          console.log('Operation error', operation.error);
          return;
        }

        // const url = operation.url.replace('http://www.dneonline.com', '/calculator');
        this.http.post(operation.url, operation.xml, { headers: operation.headers, responseType: 'text' })
          .subscribe(
            response => {
              this.xmlResponse = response.toString();
              this.jsonResponse = this.client.parseResponseBody(response.toString());
              try {
                console.log(this.jsonResponse);
                this.message = this.jsonResponse.Body.AddResponse.AddResult;
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

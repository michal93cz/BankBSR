import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxSoapModule } from 'ngx-soap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
    MatButtonModule,
    MatSidenavContainer,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule
  } from '@angular/material';


import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { AtmComponent } from './atm/atm.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AtmComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxSoapModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule
  ],
  providers: [HttpClientModule],
  bootstrap: [AppComponent]
})
export class AppModule { }

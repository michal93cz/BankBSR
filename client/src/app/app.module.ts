import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgxSoapModule } from 'ngx-soap';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import {
    MatButtonModule,
    MatSidenavContainer,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    MatSelectModule
  } from '@angular/material';


import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { AtmComponent } from './atm/atm.component';
import { HistoryComponent } from './history/history.component';
import { TransferComponent } from './transfer/transfer.component';
import { AuthService } from './auth.service';
import { LogInGuard } from './log-in.guard';
import { LogOutGuard } from './log-out.guard';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AtmComponent,
    TransferComponent,
    HistoryComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NgxSoapModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    MatSelectModule
  ],
  providers: [
    HttpClientModule,
    AuthService,
    LogInGuard,
    LogOutGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

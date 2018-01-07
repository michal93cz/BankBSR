import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AtmComponent } from './atm/atm.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'atm', component: AtmComponent },
  { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/', pathMatch: 'full'}
];

@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes) ]
})
export class AppRoutingModule { }

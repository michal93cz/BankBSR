import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AtmComponent } from './atm/atm.component';
import { TransferComponent } from './transfer/transfer.component';
import { LoginComponent } from './login/login.component';
import { HistoryComponent } from './history/history.component';
import { LogInGuard } from './log-in.guard';
import { LogOutGuard } from './log-out.guard';

const routes: Routes = [
  { path: 'atm', component: AtmComponent, canActivate: [LogInGuard] },
  { path: 'transfer', component: TransferComponent, canActivate: [LogInGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [LogInGuard] },
  { path: 'login', component: LoginComponent, canActivate: [LogOutGuard] },
  { path: '',   redirectTo: '/atm', pathMatch: 'full' },
  { path: '**', redirectTo: '/atm', pathMatch: 'full'}
];

@NgModule({
  exports: [ RouterModule ],
  imports: [ RouterModule.forRoot(routes) ]
})
export class AppRoutingModule { }

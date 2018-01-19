import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public model = {
      username: '',
      password: ''
    };

  public error = '';

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.authService.logIn(this.model.username, this.model.password)
    .subscribe(
      (success) => {
        this.error = '';
        this.router.navigate(['/']);
      },
      (error) => this.error = error
    );
  }
}

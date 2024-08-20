import { MatButton, MatIconButton } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  MatFormField,
  MatInput,
  MatLabel,
  MatSuffix,
} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'TTP-sign-up',
  standalone: true,
  imports: [
    CommonModule,
    MatButton,
    MatInput,
    MatIcon,
    MatLabel,
    MatFormField,
    MatIconButton,
    MatSuffix,
  ],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
})
export class SignUpComponent {
  signUpButtonName = 'Register';
  signInButtonName = 'Sign In';
  formTitle = 'Sign Up';
  hide = signal(true);

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.hide.set(!this.hide());
  }

  navigateSignIn() {
    this.router.navigate(['/signin']);
  }

  registerUser() {
    console.log('lalala');
  }
}

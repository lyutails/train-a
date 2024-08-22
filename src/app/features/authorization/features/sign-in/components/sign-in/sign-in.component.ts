import { Component } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { SignInForm } from '../../models/sign-in.model';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../../../../common/button/button.component';
import { UserInfo } from '../../../../models/user-info.model';
import { AuthFacade } from '../../../../../../core/authorization/services/auth.facade';

@Component({
  selector: 'TTP-sign-in',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    ButtonComponent,
  ],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent {
  public signInForm: FormGroup<SignInForm>;
  public signInButtonName = 'Sign In';
  public isSubmitting = false;
  public emailErrorMessage: string | null = null;
  public passwordErrorMessage: string | null = null;

  constructor(
    private readonly fb: NonNullableFormBuilder,
    private router: Router,
    private readonly authFacade: AuthFacade,
  ) {
    this.signInForm = this.signInFormInstance;
  }

  public onSubmit(): void {
    if (this.signInForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.clearErrorMessages();
    this.authFacade.signIn(this.userInfo).subscribe({
      next: ({ token }) => {
        this.authFacade.saveUserInfo(token);
      },
      error: (error: HttpErrorResponse) => {
        this.handleAuthError(error);
        this.isSubmitting = false;
      },
      complete: () => {
        this.router.navigate(['/']);
      },
    });
  }

  private handleAuthError(error: HttpErrorResponse): void {
    //TODO The errors does not appear in the form
    if (error.status === 404) {
      this.emailErrorMessage = 'User is not found';
      this.passwordErrorMessage = null;
    } else if (error.status === 400) {
      this.emailErrorMessage = 'Incorrect email or password';
      this.passwordErrorMessage = 'Incorrect email or password';
    } else if (error.status === 422) {
      this.emailErrorMessage = 'Invalid email format';
    } else {
      this.emailErrorMessage = 'Authentication failed';
      this.passwordErrorMessage = 'Authentication failed';
    }
  }

  private clearErrorMessages(): void {
    this.emailErrorMessage = null;
    this.passwordErrorMessage = null;
  }

  private get signInFormInstance(): FormGroup<SignInForm> {
    return this.fb.group<SignInForm>({
      email: this.fb.control(
        { value: '', disabled: false },
        {
          validators: [
            Validators.required,
            Validators.pattern('^[a-zA-Zа-яА-Я0-9._%+-]+@[a-zA-Zа-яА-Я0-9.-]+\\.[a-zA-Zа-яА-Я]{2,}$'),
          ],
        },
      ),
      password: this.fb.control(
        {
          value: '',
          disabled: false,
        },
        [Validators.required, Validators.minLength(8), Validators.pattern('^\\S*$')],
      ),
    });
  }

  public get redirectToSignUp() {
    return this.router.navigate(['/auth/signup']);
  }

  public get userInfo(): UserInfo {
    return {
      email: this.signInForm.controls.email.value,
      password: this.signInForm.controls.password.value,
    };
  }
}

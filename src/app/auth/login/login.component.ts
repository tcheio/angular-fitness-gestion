import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  private redirectUrl: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.redirectUrl = this.route.snapshot.queryParamMap.get('redirectTo');
  }

  onSubmit(): void {
  this.errorMessage = '';
  if (!this.email || !this.password) {
    this.errorMessage = 'Veuillez saisir un email et un mot de passe.';
    return;
  }

  this.loading = true;

  this.authService.login(this.email, this.password).subscribe({
    next: () => {
      this.loading = false;
      this.router.navigateByUrl('/home');   // 🔥 redirection forcée vers home
    },
    error: (err) => {
      this.loading = false;
      this.errorMessage = err?.message || 'Erreur de connexion';
    },
  });
}

}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../../../models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
})
export class UserFormComponent implements OnInit {
  form!: FormGroup;
  userId: number | null = null;
  loading = false;

  roles = ['admin', 'prof', 'adherent'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      role: ['', Validators.required],
      salleId: [1, Validators.required],
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.userId = +idParam;
      this.loadUser(this.userId);
    }
  }

  private loadUser(id: number): void {
    this.loading = true;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.loading = false;
        this.form.patchValue({
          prenom: user.prenom,
          nom: user.nom,
          email: user.email,
          password: user.password,
          role: user.role,
          salleId: user.salleId,
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value as Omit<User, 'id'>;

    if (this.userId) {
      const payload: User = { id: this.userId, ...value };
      this.userService.updateUser(this.userId, payload).subscribe(() => {
        this.router.navigate(['/users']);
      });
    } else {
      this.userService.createUser(value).subscribe(() => {
        this.router.navigate(['/users']);
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/users']);
  }
}

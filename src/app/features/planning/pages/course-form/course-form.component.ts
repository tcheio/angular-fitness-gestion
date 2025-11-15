import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  Cours,
  Niveau,
  PlanningService,
  Salle,
} from '../../services/planning.service';
import { AuthService, User } from '../../../../auth/auth.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss'],
})
export class CourseFormComponent implements OnInit {
  form!: FormGroup;
  salles: Salle[] = [];
  profs: User[] = [];

  isAdmin = false;
  isProf = false;
  currentUser!: User;
  courseId: number | null = null;
  errorMessage: string | null = null;

  niveaux: Niveau[] = ['beginner', 'intermediate', 'advanced'];

  constructor(
    private fb: FormBuilder,
    private planningService: PlanningService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = user;
    this.isAdmin = this.auth.isAdmin();
    this.isProf = this.auth.isProf();

    this.form = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      salleId: ['', Validators.required],
      date: [null, Validators.required],
      heureDebut: ['', Validators.required], // "HH:mm"
      duree: [60, [Validators.required, Validators.min(15)]],
      capacite: [10, [Validators.required, Validators.min(1)]],
      niveau: ['beginner', Validators.required],
      profId: [''], // utilisé seulement pour admin
    });

    this.loadSalles();
    if (this.isAdmin) {
      this.loadProfs();
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.courseId = +idParam;
      this.loadCourse(this.courseId);
    } else {
      // pour un prof, on fixe son id
      if (this.isProf && !this.isAdmin) {
        this.form.patchValue({ profId: this.currentUser.id });
      }
    }
  }

  loadSalles(): void {
    this.planningService.getSalles().subscribe((s) => (this.salles = s));
  }

  loadProfs(): void {
    this.planningService.getProfs().subscribe((p) => (this.profs = p));
  }

  loadCourse(id: number): void {
    this.planningService.getCourseById(id).subscribe((c) => {
      // sécurité : un prof ne peut éditer que ses cours
      if (this.isProf && !this.isAdmin && c.profId != this.currentUser.id) {
        this.router.navigate(['/planning/cours']);
        return;
      }

      const start = new Date(c.horaire);
      const date = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate()
      );
      const heureDebut = `${String(start.getHours()).padStart(2, '0')}:${String(
        start.getMinutes()
      ).padStart(2, '0')}`;

      this.form.patchValue({
        titre: c.titre,
        description: c.description,
        salleId: c.salleId,
        date,
        heureDebut,
        duree: c.duree,
        capacite: c.capacite,
        niveau: c.niveau ?? 'intermediate',
        profId: c.profId,
      });
    });
  }

  // course-form.component.ts

submit(): void {
  this.errorMessage = null;

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const value = this.form.value;
  // value.date est une STRING → on convertit
const rawDate = new Date(value.date);

if (isNaN(rawDate.getTime())) {
  this.errorMessage = 'La date est invalide.';
  return;
}

const [hStr, mStr] = (value.heureDebut as string).split(':');

const start = new Date(
  rawDate.getFullYear(),
  rawDate.getMonth(),
  rawDate.getDate(),
  Number(hStr),
  Number(mStr),
  0
);

const duree = Number(value.duree);
const end = new Date(start.getTime() + duree * 60_000);


  // profId selon rôle
  let profId: number;
  if (this.isAdmin) {
    profId = Number(value.profId);
  } else {
    profId = Number(this.currentUser.id); // le prof ne peut créer que pour lui
  }

  const payload: Omit<Cours, 'id'> = {
    titre: value.titre,
    description: value.description,
    profId,
    salleId: Number(value.salleId),
    horaire: start.toISOString(),
    duree,
    capacite: Number(value.capacite),
    niveau: value.niveau,
  };

  // Vérif de chevauchement pour ce prof
  this.planningService.getRawCourses().subscribe((all) => {
    const conflicts = all.filter((c) => {
      if (c.profId != profId) return false;
      if (this.courseId && c.id === this.courseId) return false;

      const cStart = new Date(c.horaire);
      const cEnd = new Date(cStart.getTime() + c.duree * 60_000);

      // chevauchement ?
      return cStart < end && start < cEnd;
    });

    if (conflicts.length > 0) {
      this.errorMessage =
        'Ce professeur a déjà un cours sur ce créneau horaire.';
      return;
    }

    // ✅ Création ou mise à jour
    if (this.courseId) {
      this.planningService.updateCourse(this.courseId, payload).subscribe({
        next: () => this.router.navigate(['/cours']),
        error: (err) => {
          console.error('Erreur update cours', err);
          this.errorMessage = 'Erreur lors de la mise à jour du cours.';
        },
      });
    } else {
      this.planningService.createCourse(payload).subscribe({
        next: (created) => {
          console.log('Cours créé :', created);
          this.router.navigate(['/cours']);
        },
        error: (err) => {
          console.error('Erreur création cours', err);
          this.errorMessage = 'Erreur lors de la création du cours.';
        },
      });
    }
  });
}

  cancel(): void {
    this.router.navigate(['/cours']);
  }
}

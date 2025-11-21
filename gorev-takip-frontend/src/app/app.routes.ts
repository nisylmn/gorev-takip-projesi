import { Routes } from '@angular/router';
import { LoginComponent } from './components/login.comp';
import { SignupComponent } from './components/sign.comp';
import { DashboardComponent } from './components/dashboard.comp';
import { AssignComponent } from './components/assign.comp';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'assign', component: AssignComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/login' },
];

import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OverviewComponent } from './dashboard/overview/overview.component';
import { PeopleComponent } from './dashboard/people/people.component';
import { MemoriesComponent } from './dashboard/memories/memories.component';
import { ActivityLogComponent } from './dashboard/activity-log/activity-log.component';
import { DevicesComponent } from './dashboard/devices/devices.component';
import { SettingsComponent } from './dashboard/settings/settings.component';
import { MedicationsComponent } from './dashboard/medications/medications.component';

import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'overview', component: OverviewComponent },
      { path: 'people', component: PeopleComponent },
      { path: 'memories', component: MemoriesComponent },
      { path: 'activity-log', component: ActivityLogComponent },
      { path: 'devices', component: DevicesComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'medications', component: MedicationsComponent },
      { path: '', redirectTo: 'overview', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];


import { Routes, RouterModule } from '@angular/router';
import { BulkDetailsComponent, BulkUploadComponent, BulkSummaryComponent, BulkSummaryQuestionComponent } from '../components/index';

import { AuthGuard } from '../../core/route-guards';

export const bulkRoutes: Routes = [
  {
    path: '',
    component: BulkSummaryComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard]
  },
  {
    path: 'detail/:bulkid',
    component: BulkSummaryQuestionComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard]
  },
  {
    path: 'upload',
    component: BulkUploadComponent,
    canActivate: [AuthGuard]
  }
];

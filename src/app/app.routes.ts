import { Routes } from '@angular/router';
import { TerminalComponent } from './components/terminal/terminal.component';
import { PortfolioPageComponent } from './pages/portfolio-page/portfolio-page.component';
import { QAPortfolioPageComponent } from './pages/qa-portfolio-page/qa-portfolio-page.component';

export const routes: Routes = [
  {
    path: '',
    component: TerminalComponent
  },
  {
    path: 'portfolio-dev',
    component: PortfolioPageComponent
  },
  {
    path: 'portfolio-qa',
    component: QAPortfolioPageComponent
  },
  // Backward compatibility - redirect old routes to new ones
  {
    path: 'portfolio',
    redirectTo: 'portfolio-dev',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

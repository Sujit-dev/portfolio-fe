import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server // Use server-side rendering for terminal (interactive)
  },
  {
    path: 'portfolio-dev',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'portfolio-qa',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];

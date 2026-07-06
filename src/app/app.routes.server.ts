import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'vehicles',
    renderMode: RenderMode.Server,
  },
  {
    path: 'vehicles/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'customer/checkout/:bookingId',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];

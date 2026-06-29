import { authRoutes } from '@/features/auth/routes';
import { Layout } from '@/features/shell/pages/Layout';
import * as React from 'react';
import {
  type RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <div>Dashboard placeholder</div> },
      { path: 'dashboard', element: <div>Dashboard placeholder</div> },
      ...authRoutes,
      { path: '*', element: <div>404 Not Found</div> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} />;
}

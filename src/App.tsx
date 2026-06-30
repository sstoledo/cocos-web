import { authRoutes } from '@/features/auth/routes';
import { Layout } from '@/features/shell/pages/Layout';

import {
  type RouteObject,
  RouterProvider,
  createBrowserRouter,
} from 'react-router';

const routes: RouteObject[] = [
  ...authRoutes,
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <div>Dashboard placeholder</div> },
      { path: 'dashboard', element: <div>Dashboard placeholder</div> },
      { path: '*', element: <div>404 Not Found</div> },
    ],
  },
];

const router = createBrowserRouter(routes);

export default function App() {
  return <RouterProvider router={router} />;
}

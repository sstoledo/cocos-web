import * as React from 'react';
import type { RouteObject } from 'react-router';
import { LoginPage } from './pages/LoginPage';

export const authRoutes: RouteObject[] = [
  { path: 'login', element: <LoginPage /> },
];

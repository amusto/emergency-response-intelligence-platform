import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import './styles.css';
import CommandCenter from './pages/CommandCenter';

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/command" replace /> },
  { path: '/command', element: <CommandCenter /> },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

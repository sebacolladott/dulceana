import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { CoreProvider } from './contexts/Core';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';
import { Home } from './routes/home';
import { PointOfSale } from './routes/point-of-sale';
import { ProductManagement } from './routes/product-management';
import { Root } from './routes/root';
import { Settings } from './routes/settings';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CoreProvider>
      <RouterProvider
        router={createHashRouter([
          {
            path: '/',
            element: <Root />,
            errorElement: <ErrorBoundary />,
            children: [
              { index: true, element: <Home /> },
              { path: 'pm', element: <ProductManagement /> },
              { path: 'pos', element: <PointOfSale /> },
              { path: 'settings', element: <Settings /> }
            ]
          }
        ])}
      />
    </CoreProvider>
  </React.StrictMode>
);

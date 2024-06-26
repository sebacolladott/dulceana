import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import { ErrorPage } from './error-page';
import './index.css';
import { PointOfSale } from './routes/point-of-sale';
import { ProductManagement } from './routes/product-management';
import { Root } from './routes/root';

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <ProductManagement /> },
      { path: '/pos', element: <PointOfSale /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
window.ipcRenderer.invoke('getProducts').then(products => {
  console.log(products);
});

// window.ipcRenderer.invoke("createProduct", {
//   barcode: "123456789",
//   name: "Pan blanco",
//   price: parseInt(2.99, 10),
//   unit_of_measurement: "kg",
// });

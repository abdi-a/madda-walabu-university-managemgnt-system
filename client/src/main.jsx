import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
  }
], {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

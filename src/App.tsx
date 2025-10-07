import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors />
    </>
  );
}

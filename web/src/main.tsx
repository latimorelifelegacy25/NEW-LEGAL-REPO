import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PrivateMatterApp from './PrivateMatterApp';
import './index.css';

createRoot(document.getElementById('root')!).render(<StrictMode><PrivateMatterApp /></StrictMode>);

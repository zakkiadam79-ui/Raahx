import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { legacyAssetManifest } from './legacyAssets';

// Keep previous API-referenced asset URLs in the build without requesting them
// during the initial page load.
void legacyAssetManifest;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
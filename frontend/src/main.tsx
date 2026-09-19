import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import './style.css';
import ApiProvider from './context/apiCommunication';
import App from './App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <BrowserRouter>
    <ApiProvider baseUrl='/api'>
      <Routes>
        <Route path="/*" element={<App />} />
      </Routes>
    </ApiProvider>
  </BrowserRouter>
);
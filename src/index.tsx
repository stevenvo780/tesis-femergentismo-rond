import React, { createContext, useContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css'
import { Entrenador } from './Universo/entrenador';
const entrenador = new Entrenador();

const UniversoAprendizajeContext = createContext<Entrenador | null>(null);

export const useUniversoAprendizaje = () => {
  const context = useContext(UniversoAprendizajeContext);
  if (!context) {
    throw new Error('useUniversoAprendizaje debe ser usado dentro de un UniversoAprendizajeProvider');
  }
  return context;
};

export const UniversoAprendizajeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  return (
    <UniversoAprendizajeContext.Provider value={entrenador}>
      {children}
    </UniversoAprendizajeContext.Provider>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <UniversoAprendizajeProvider>
      <App />
    </UniversoAprendizajeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

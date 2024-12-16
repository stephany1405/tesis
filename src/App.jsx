import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Inicio from './components/inicio/inicio';
import Manicura from './components/categorias/Page/Manicura';
import Corporal from './components/categorias/Page/corporal';
import Pedicura from './components/categorias/Page/pedicura';
import Extension from './components/categorias/Page/extension'
import Epilacion from './components/categorias/Page/Epilacion'
import Facial from './components/categorias/Page/facial'
import Quiropodia from './components/categorias/Page/Quiropodia'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/servicios/manicura" element={<Manicura />} />
        <Route path="/servicios/corporales" element={<Corporal />} />
        <Route path="/servicios/pedicura" element={<Pedicura />} />
        <Route path="/servicios/extension" element={<Extension />} />
        <Route path="/servicios/epilacion" element={<Epilacion />} />
        <Route path="/servicios/facial" element={<Facial />} />
        <Route path="/servicios/quiropodia" element={<Quiropodia />} />
      </Routes>
    </Router>
  );
};

export default App;
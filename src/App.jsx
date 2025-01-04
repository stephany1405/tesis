import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/inicio/header';
import Inicio from './components/inicio/inicio';
import Bolsa from './components/inicio/bolsa';
import Manicura from './components/categorias/Page/Manicura';
import Corporal from './components/categorias/Page/Corporal';
import Pedicura from './components/categorias/Page/Pedicura';
import Extension from './components/categorias/Page/Extension';
import Epilacion from './components/categorias/Page/Epilacion';
import Facial from './components/categorias/Page/Facial';
import Quiropodia from './components/categorias/Page/Quiropodia';

const App = ({ cartItems, addToCart, updateQuantity, removeFromCart }) => {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/servicios/manicuras/:categoryID" element={<Manicura addToCart={addToCart} />} />
          <Route path="/servicios/corporales/:categoryID" element={<Corporal addToCart={addToCart} />} />
          <Route path="/servicios/pedicura/:categoryID" element={<Pedicura addToCart={addToCart} />} />
          <Route path="/servicios/extension/:categoryID" element={<Extension addToCart={addToCart} />} />
          <Route path="/servicios/epilacion/:categoryID" element={<Epilacion addToCart={addToCart} />} />
          <Route path="/servicios/facial/:categoryID" element={<Facial addToCart={addToCart} />} />
          <Route path="/servicios/quiropodia/:categoryID" element={<Quiropodia addToCart={addToCart} />} />
          <Route path="/bolsa" element={<Bolsa cartItems={cartItems} updateQuantity={updateQuantity} removeFromCart={removeFromCart} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

<<<<<<< HEAD
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/login/login.jsx";
import Registro from "./components/registro/registro.jsx";
import Inicio from "./components/inicio/inicio";
import Manicura from "./components/categorias/Page/Manicura";
import Corporal from "./components/categorias/Page/Corporal";
import Pedicura from "./components/categorias/Page/Pedicura";
import Extension from "./components/categorias/Page/Extension";
import Epilacion from "./components/categorias/Page/Epilacion";
import Facial from "./components/categorias/Page/Facial";
import Quiropodia from "./components/categorias/Page/Quiropodia";
=======
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
>>>>>>> 9dfa6364e97d5b90445affaa0753b9d91fe89f5d

const App = ({ cartItems, addToCart, updateQuantity, removeFromCart }) => {
  return (
    <Router>
<<<<<<< HEAD
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/registro" element={<Registro/>} />
        <Route path="/cliente" element={<Inicio />} />
        <Route path="/servicios/manicuras/:categoryID" element={<Manicura />} />
        <Route
          path="/servicios/corporales/:categoryID"
          element={<Corporal />}
        />
        <Route path="/servicios/pedicura/:categoryID" element={<Pedicura />} />
        <Route
          path="/servicios/extension/:categoryID"
          element={<Extension />}
        />
        <Route
          path="/servicios/epilacion/:categoryID"
          element={<Epilacion />}
        />
        <Route path="/servicios/facial/:categoryID" element={<Facial />} />
        <Route
          path="/servicios/quiropodia/:categoryID"
          element={<Quiropodia />}
        />
      </Routes>
=======
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
>>>>>>> 9dfa6364e97d5b90445affaa0753b9d91fe89f5d
    </Router>
  );
};

export default App;

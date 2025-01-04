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

const App = () => {
  return (
    <Router>
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
    </Router>
  );
};

export default App;

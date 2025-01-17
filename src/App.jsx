import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./components/inicio/useContext";
import Layout from "./components/layouts/layout.jsx";
import Inicio from "./components/inicio/inicio.jsx";
import Bolsa from "./components/inicio/bolsa.jsx";
import Manicura from "./components/categorias/Page/Manicura.jsx";
import Corporal from "./components/categorias/Page/Corporal.jsx";
import Pedicura from "./components/categorias/Page/Pedicura.jsx";
import Extension from "./components/categorias/Page/Extension.jsx";
import Epilacion from "./components/categorias/Page/Epilacion.jsx";
import Facial from "./components/categorias/Page/Facial.jsx";
import Quiropodia from "./components/categorias/Page/Quiropodia.jsx";
import Login from "./components/login/login.jsx";
import Registro from "./components/registro/registro.jsx";
import ProtectedRoute from "./components/middlewares/protectedRoute.jsx";
import CheckOutSuccess from "./components/inicio/CheckSuccess.jsx";
import Agenda from "./components/agenda/agenda.jsx"
import Perfil from "./components/Perfil/perfil.jsx"

const App = () => {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/inicio" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/inicio"
            element={
              <ProtectedRoute>
                <Layout>
                  <Inicio />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/success"
            element={
              <ProtectedRoute>
                <CheckOutSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/servicios/manicuras/:categoryID"
            element={
              <ProtectedRoute>
                <Layout>
                  <Manicura />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/corporales/:categoryID"
            element={
              <ProtectedRoute>
                <Layout>
                  <Corporal />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/pedicura/:categoryID"
            element={
              <ProtectedRoute>
                <Layout>
                  <Pedicura />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/extension/:categoryID"
            element={
              <ProtectedRoute>
                <Layout>
                  <Extension />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/epilacion/:categoryID"
            element={
              <ProtectedRoute>
                <Layout>
                  <Epilacion />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/facial/:categoryID"
            element={
              <ProtectedRoute>
                <Layout>
                  <Facial />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/quiropodia/:categoryID"
            element={
              <ProtectedRoute>
                <Layout>
                  <Quiropodia />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/bolsa"
            element={
              <ProtectedRoute>
                <Layout>
                  <Bolsa />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <Layout>
                  <Agenda />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Layout>
                  <Perfil/>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;

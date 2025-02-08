import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { CartProvider } from "./components/inicio/useContext";
import Layout from "./components/layouts/layout.jsx";
import Inicio from "./components/inicio/inicio.jsx";
import Bolsa from "./components/bolsa/bolsa.jsx";
import DynamicCategory from "./components/categorias/DinamycCategory.jsx";
import ProtectedRoute from "./components/middlewares/protectedRoute.jsx";
import CheckOutSuccess from "./components/inicio/CheckSuccess.jsx";
import Agenda from "./components/agenda/agenda.jsx";
import Perfil from "./components/Perfil/perfil.jsx";
import { useRoles } from "./components/inicio/hooks/useRoles.js";
import { PublicRoutes } from "./components/routes/PublicRoutes.jsx";

// Rutas para especialista
import Bienvenida from "./components/especialista/dashboard.jsx";

// Rutas para admin
import Sidebar from "./components/administrador/sidebar.jsx";
import Home from "./components/administrador/home.jsx";
import Perfiles from "./components/administrador/clientes/perfiles.jsx";
import PerfilesE from "./components/administrador/especialista/perfilesE.jsx";
import Servicios from "./components/administrador/servicios/servicios.jsx";
import Cita from "./components/administrador/citas/cita.jsx";
import Estadisticas from "./components/administrador/estadisticas/estadisticas.jsx";
import Backup from "./components/administrador/backup/backup.jsx";
const App = () => {
  const roles = useRoles();

  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/*" element={<PublicRoutes />} />

          {/* Rutas de Usuario */}
          <Route
            path="/inicio"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Inicio />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Ruta dinámica para todas las categorías de servicios */}
          <Route
            path="/servicios/:categoryType/:categoryID"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <DynamicCategory />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Otras rutas de usuario */}
          <Route
            path="/checkout/success"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <CheckOutSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bolsa"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Bolsa />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agenda"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Agenda />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/perfil"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Perfil />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Ruta de especialista */}
          <Route
            path="/especialista"
            element={
              <ProtectedRoute requiredRole={roles.specialist}>
                <Bienvenida />
              </ProtectedRoute>
            }
          />

          {/* Rutas de Administrador */}
          <Route
            path="/administrador/*"
            element={
              <ProtectedRoute requiredRole={roles.administrador}>
                <div style={{ display: "flex" }}>
                  <Sidebar />
                  <div style={{ flexGrow: 1, padding: "20px" }}>
                    <Routes>
                      <Route index element={<Home />} />
                      <Route path="clientes" element={<Perfiles />} />
                      <Route path="especialistas" element={<PerfilesE />} />
                      <Route path="servicios" element={<Servicios />} />
                      <Route path="citas" element={<Cita />} />
                      <Route path="estadisticas" element={<Estadisticas />} />
                      <Route path="backup" element={<Backup />} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;

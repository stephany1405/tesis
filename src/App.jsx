import React from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { CartProvider } from "./components/inicio/useContext"
import Layout from "./components/layouts/layout.jsx"
import Inicio from "./components/inicio/inicio.jsx"
import Bolsa from "./components/inicio/bolsa.jsx"
import Manicura from "./components/categorias/Page/Manicura.jsx"
import Corporal from "./components/categorias/Page/Corporal.jsx"
import Pedicura from "./components/categorias/Page/Pedicura.jsx"
import Extension from "./components/categorias/Page/Extension.jsx"
import Epilacion from "./components/categorias/Page/Epilacion.jsx"
import Facial from "./components/categorias/Page/Facial.jsx"
import Quiropodia from "./components/categorias/Page/Quiropodia.jsx"
import ProtectedRoute from "./components/middlewares/protectedRoute.jsx"
import CheckOutSuccess from "./components/inicio/CheckSuccess.jsx"
import Agenda from "./components/agenda/agenda.jsx"
import Perfil from "./components/Perfil/perfil.jsx"
import { useRoles } from "./components/inicio/hooks/useRoles.js"
import { PublicRoutes } from "./components/routes/PublicRoutes.jsx"
//rutas para especialista

import Bienvenida from "./components/especialista/dashboard.jsx"

//rutas para admin

import Sidebar from "./components/administrador/sidebar.jsx"
import Home from "./components/administrador/home.jsx"
import Perfiles from "./components/administrador/clientes/perfiles.jsx"
import PerfilesE from "./components/administrador/especialista/perfilesE.jsx"
import Servicios from "./components/administrador/servicios/servicios.jsx"
import Cita from "./components/administrador/citas/cita.jsx"
import Finanzas from "./components/administrador/finanzas/finananzas.jsx"
import Estadisticas from "./components/administrador/estadisticas/estadisticas.jsx"

const App = () => {
  const roles = useRoles()
  return (
    <CartProvider>
      <Router>
        <Routes>
          {/* ruta publica */}
          <Route path="/*" element={<PublicRoutes />} />
          {/* termina ruta publica */}

          {/* ruta Usuario */}

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
          <Route
            path="/checkout/success"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <CheckOutSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/servicios/manicuras/:categoryID"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Manicura />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/corporales/:categoryID"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Corporal />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/pedicura/:categoryID"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Pedicura />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/extension/:categoryID"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Extension />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/epilacion/:categoryID"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Epilacion />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/facial/:categoryID"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Facial />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicios/quiropodia/:categoryID"
            element={
              <ProtectedRoute requiredRole={roles.cliente}>
                <Layout>
                  <Quiropodia />
                </Layout>
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
          {/* termina ruta usuario */}
          {/* inicia ruta especialista  */}
          <Route
            path="/especialista"
            element={
              <ProtectedRoute requiredRole={roles.specialist}>
                <Bienvenida />
              </ProtectedRoute>
            }
          />
          {/* termina ruta especialista */}
          {/* Inicia Ruta Administrador */}
          <Route
            path="/administrador/*"
            element={
              <ProtectedRoute requiredRole={roles.administrador}>
                <div style={{ display: "flex" }}>
                  <Sidebar />
                  <div style={{ flexGrow: 1, padding: "20px" }}>
                    <Routes>
                      <Route index element={<Home />} />
                      <Route path="clientes" element={<div><Perfiles/></div>} />
                      <Route path="especialistas" element={<div><PerfilesE/></div>} />
                      <Route path="servicios" element={<div><Servicios/></div>} />
                      <Route path="citas" element={<div><Cita/></div>} />
                      <Route path="finanzas" element={<div><Finanzas/></div>} />
                      <Route path="estadisticas" element={<div><Estadisticas/></div>} />
                    </Routes>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          {/* Termina ruta Administrador */}
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App


import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Navbar from "./components/navbar";
import Inicio from "./pages/inicio";
import Propiedades from "./pages/propiedades";
import Contacto from "./pages/contacto";
import Footer from "./components/footer";
import Login from "./components/Login";
import Admin from "./pages/Admin";
import PropiedadesAdmin from "./pages/PropiedadesAdmin";
import UsuariosAdmin from "./pages/UsuariosAdmin";
import ListaPropiedades from "./components/ListaPropiedades";
import EditarPropiedad from "./components/EditarPropiedad";
import AgregarPropiedad from "./components/AgregarPropiedad";
import PropiedadDetalle from "./pages/PropiedadDetalle";

const PrivateRoute = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate("/login", { state: { from: location }, replace: true });
    return null;
  }

  if (user?.rol !== "admin" && location.pathname.startsWith("/admin")) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  const { checkAuth } = useAuth();

  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/propiedades" element={<Propiedades />} />
      <Route path="/propiedad/:id" element={<PropiedadDetalle />} />
      <Route path="/contacto" element={<Contacto />} />
      <Route path="/login" element={<Login />} />

      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/propiedades" element={<PropiedadesAdmin />} />
        <Route path="/admin/usuarios" element={<UsuariosAdmin />} />
        <Route path="/admin/lista" element={<ListaPropiedades />} />
        <Route
          path="/admin/editar-propiedad/:id"
          element={<EditarPropiedad />}
        />
        <Route path="/admin/agregar-propiedad" element={<AgregarPropiedad />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AppRoutes />
        <Footer />
      </Router>
    </AuthProvider>
  );
}

import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";

function Footer() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminClick = () => {
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Estilos consistentes con navbar.js
  const footerStyle = {
    backgroundColor: "#333",
    color: "#fff",
    textAlign: "center",
    padding: "20px",
    marginTop: "auto",
  };

  const listStyle = {
    listStyle: "none",
    padding: 0,
    display: "flex",
    justifyContent: "center",
    gap: "20px",
    margin: "15px 0",
  };

  const navLinkStyle = {
    color: "#fff",
    textDecoration: "none",
    padding: "5px 10px",
    cursor: "pointer",
  };

  const activeStyle = {
    fontWeight: "bold",
    borderBottom: "2px solid #fff",
  };

  const buttonStyle = {
    background: "none",
    border: "none",
    color: "#fff",
    cursor: "pointer",
    padding: "5px 10px",
    fontSize: "inherit",
    fontFamily: "inherit",
  };

  // Función para combinar estilos
  const getLinkStyle = (path) => {
    return isActive(path) ? { ...navLinkStyle, ...activeStyle } : navLinkStyle;
  };

  return (
    <footer style={footerStyle}>
      <p>
        &copy; {new Date().getFullYear()} SD Propiedades. Todos los derechos
        reservados.
      </p>
      <nav>
        <ul style={listStyle}>
          <li>
            <Link to="/" style={getLinkStyle("/")}>
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/propiedades" style={getLinkStyle("/propiedades")}>
              Propiedades
            </Link>
          </li>
          <li>
            <Link to="/contacto" style={getLinkStyle("/contacto")}>
              Contacto
            </Link>
          </li>
          {isAuthenticated ? (
            <li>
              <button onClick={logout} style={buttonStyle}>
                Cerrar Sesión
              </button>
            </li>
          ) : (
            <li>
              <button onClick={handleAdminClick} style={buttonStyle}>
                Acceso Administración
              </button>
            </li>
          )}
        </ul>
      </nav>

      <p>Contáctanos: info@sdpropiedades.cl | +56 9 1234 5678</p>
    </footer>
  );
}

export default Footer;

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import logo from "../img/logo_sdp_400x150.png";
import { useAuth } from "./AuthContext";

function Navbar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  // Estilos consistentes con footer.js
  const headerStyle = {
    backgroundColor: "#333",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
  };

  const logoStyle = {
    height: "60px",
  };

  const navListStyle = {
    listStyle: "none",
    padding: 0,
    display: "flex",
    gap: "20px",
  };

  const navLinkStyle = {
    color: "#fff",
    textDecoration: "none",
    padding: "5px 10px",
  };

  const activeStyle = {
    fontWeight: "bold",
    borderBottom: "2px solid #fff",
  };

  const socialStyle = {
    display: "flex",
    gap: "15px",
    fontSize: "20px",
  };

  const socialLinkStyle = {
    color: "#fff",
  };

  return (
    <header style={headerStyle}>
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Logo SD Propiedades" style={logoStyle} />
        </Link>
      </div>

      <nav className="nav">
        <ul style={navListStyle}>
          <li>
            <Link
              to="/"
              style={{
                ...navLinkStyle,
                ...(isActive("/") && activeStyle),
              }}
            >
              Inicio
            </Link>
          </li>
          <li>
            <Link
              to="/propiedades"
              style={{
                ...navLinkStyle,
                ...(isActive("/propiedades") && activeStyle),
              }}
            >
              Propiedades
            </Link>
          </li>
          <li>
            <Link
              to="/contacto"
              style={{
                ...navLinkStyle,
                ...(isActive("/contacto") && activeStyle),
              }}
            >
              Contacto
            </Link>
          </li>
          {isAuthenticated && (
            <li>
              <Link
                to="/admin"
                style={{
                  ...navLinkStyle,
                  ...(isActive("/admin") && activeStyle),
                }}
              >
                Panel de Administración
              </Link>
            </li>
          )}
        </ul>
      </nav>

      <div style={socialStyle}>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          style={socialLinkStyle}
        >
          <FaFacebook />
        </a>
        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          style={socialLinkStyle}
        >
          <FaTwitter />
        </a>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          style={socialLinkStyle}
        >
          <FaInstagram />
        </a>
      </div>
    </header>
  );
}

export default Navbar;

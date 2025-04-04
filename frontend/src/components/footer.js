import React, { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaHome,
  FaBuilding,
  FaEnvelope,
  FaUserAlt,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from "react-icons/fi";
import "../styles/NavbarFooter.css";

function Footer() {
  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminClick = () => navigate("/login");
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { path: "/", name: "Inicio", icon: <FaHome /> },
    { path: "/propiedades", name: "Propiedades", icon: <FaBuilding /> },
    { path: "/contacto", name: "Contacto", icon: <FaEnvelope /> },
  ];

  const socialLinks = [
    { url: "https://facebook.com", icon: <FiFacebook />, name: "Facebook" },
    { url: "https://twitter.com", icon: <FiTwitter />, name: "Twitter" },
    { url: "https://instagram.com", icon: <FiInstagram />, name: "Instagram" },
    { url: "https://linkedin.com", icon: <FiLinkedin />, name: "LinkedIn" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-title">SD Propiedades</h3>
          <p className="footer-text">
            Encuentra la propiedad perfecta para ti con nuestro equipo de
            expertos.
          </p>
          <div className="footer-social">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Enlaces Rápidos</h3>
          <ul className="footer-links">
            {footerLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`footer-link ${
                    location.pathname === link.path ? "active" : ""
                  }`}
                >
                  <span className="link-icon">{link.icon}</span>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Contacto</h3>
          <address className="footer-contact">
            <p>Av. Principal 1234, Santiago</p>
            <p>Tel: +56 9 1234 5678</p>
            <p>Email: info@sdpropiedades.cl</p>
            <p>Horario: Lunes a Viernes 9:00 - 18:00</p>
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-nav">
          {isAuthenticated ? (
            <button onClick={logout} className="footer-button">
              <FaSignOutAlt /> Cerrar Sesión
            </button>
          ) : (
            <button onClick={handleAdminClick} className="footer-button">
              <FaSignInAlt /> Acceso Administración
            </button>
          )}
        </div>
        <p className="copyright">
          &copy; {currentYear} SD Propiedades. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;

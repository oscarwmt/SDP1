import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { FiUser, FiHome, FiSearch, FiMail } from "react-icons/fi";
import logo from "../img/logo_sdp_400x150.png";
import { useAuth } from "./AuthContext";
import "../styles/NavbarFooter.css";

function Navbar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navItems = [
    { path: "/", name: "Inicio", icon: <FiHome /> },
    { path: "/propiedades", name: "Propiedades", icon: <FiSearch /> },
    { path: "/contacto", name: "Contacto", icon: <FiMail /> },
    ...(isAuthenticated
      ? [{ path: "/admin", name: "Admin", icon: <FiUser /> }]
      : []),
  ];

  return (
    <header
      className={`navbar ${scrolled ? "scrolled" : ""} ${isOpen ? "open" : ""}`}
    >
      <div className="navbar-container">
        <div className="logo-container">
          <Link to="/">
            <img src={logo} alt="Logo SD Propiedades" className="logo" />
          </Link>
          <button className="mobile-menu-button" onClick={toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        <nav className={`nav ${isOpen ? "active" : ""}`}>
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="social-container">
          <div className="social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebook className="social-icon" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter className="social-icon" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaInstagram className="social-icon" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

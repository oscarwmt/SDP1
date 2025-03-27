import React, { useContext } from "react";
import { Link } from "react-router-dom"; // Para crear enlaces
import AuthContext from "../components/AuthContext"; // Importar AuthContext directamente

function Admin() {
  const { isAuthenticated } = useContext(AuthContext); // Usar el contexto

  return (
    <div style={styles.container}>
      <h1>Panel de Administración</h1>
      {isAuthenticated ? (
        <div style={styles.menu}>
          <h2>Opciones de Administración</h2>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <Link to="/admin/propiedades" style={styles.link}>
                Administrar Propiedades
              </Link>
            </li>
            <li style={styles.listItem}>
              <Link to="/admin/usuarios" style={styles.link}>
                Administrar Usuarios
              </Link>
            </li>
          </ul>
        </div>
      ) : (
        <p>No tienes acceso a esta página. Por favor, inicia sesión.</p>
      )}
    </div>
  );
}

// Estilos para el componente
const styles = {
  container: {
    padding: "20px",
    textAlign: "center",
  },
  menu: {
    marginTop: "20px",
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  listItem: {
    margin: "10px 0",
  },
  link: {
    textDecoration: "none",
    color: "#007bff",
    fontSize: "18px",
    fontWeight: "bold",
  },
};

export default Admin;

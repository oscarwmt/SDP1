import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/PropiedadesAdmin.css"; // Importar el archivo CSS

function PropiedadesAdmin() {
  const [propiedades, setPropiedades] = useState([]);
  const navigate = useNavigate();

  // Obtener la lista de propiedades
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchPropiedades = async () => {
      try {
        const response = await axios.get("/api/propiedades", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPropiedades(response.data);
      } catch (error) {
        console.error("Error al obtener propiedades:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchPropiedades();
  }, [navigate]);

  // Función mejorada para eliminar propiedades
  const handleEliminar = async (id) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Sesión no encontrada. Redirigiendo al login...");
        navigate("/login");
        return;
      }

      // 1. Primero verificar el token
      const verification = await axios.get("/api/verify-token", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // 2. Verificar si es administrador
      if (!verification.data.isAdmin) {
        alert("No tienes permisos de administrador");
        return;
      }

      // 3. Confirmar eliminación
      const confirmacion = window.confirm(
        "¿Estás seguro de eliminar esta propiedad?"
      );
      if (!confirmacion) return;

      // 4. Ejecutar eliminación
      const response = await axios.delete(`/api/propiedades/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("Propiedad eliminada correctamente");
        setPropiedades((prev) => prev.filter((prop) => prop.id !== id));
      }
    } catch (error) {
      console.error("Error completo:", error);

      if (error.response?.status === 403) {
        if (error.response.data?.error === "Token expirado") {
          alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert(
            "Error de permisos: " +
              (error.response.data?.error ||
                "No tienes los permisos necesarios")
          );
        }
      } else {
        alert("Error al eliminar: " + (error.message || "Intente nuevamente"));
      }
    }
  };

  return (
    <div className="propiedades-admin-container">
      <h2 className="propiedades-admin-title">Gestión de Propiedades</h2>
      <div>
        <button
          className="propiedades-admin-btn propiedades-admin-btn-primary"
          onClick={() => navigate("/admin/agregar-propiedad")}
        >
          Agregar Propiedad
        </button>
      </div>

      <div className="propiedades-admin-table-container">
        <table className="propiedades-admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {propiedades.map((propiedad) => (
              <tr key={propiedad.id}>
                <td>{propiedad.titulo}</td>
                <td>{propiedad.descripcion.substring(0, 50)}...</td>
                <td>
                  <Link
                    to={`/admin/editar-propiedad/${propiedad.id}`}
                    className="propiedades-admin-btn propiedades-admin-btn-warning"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleEliminar(propiedad.id)}
                    className="propiedades-admin-btn propiedades-admin-btn-danger"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PropiedadesAdmin;

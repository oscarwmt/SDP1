import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function ListaPropiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const navigate = useNavigate();

  // Obtener la lista de propiedades al cargar el componente
  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const response = await fetch("/api/propiedades");
        if (!response.ok) {
          throw new Error("Error al obtener las propiedades");
        }
        const data = await response.json();
        setPropiedades(data);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchPropiedades();
  }, []);

  // Función para eliminar una propiedad
  const handleEliminar = async (id) => {
    try {
      const response = await fetch(`/api/propiedades/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPropiedades(propiedades.filter((prop) => prop.id !== id)); // Actualizar la lista
      } else {
        console.error("Error al eliminar la propiedad");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="lista-propiedades">
      <h1>Lista de Propiedades</h1>
      <button onClick={() => navigate("/admin/agregar-propiedad")}>
        Agregar Propiedad
      </button>
      <ul>
        {propiedades.map((prop) => (
          <li key={prop.id}>
            <span>{prop.titulo}</span>
            <Link to={`/admin/editar-propiedad/${prop.id}`}>Editar</Link>
            <button onClick={() => handleEliminar(prop.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaPropiedades;

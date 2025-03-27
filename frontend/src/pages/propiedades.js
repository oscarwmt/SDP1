import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/Propiedades.css"; // Importar el archivo CSS

function Propiedades() {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(10);
  const location = useLocation();

  // Obtener las propiedades desde el backend con filtros
  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const ciudad = searchParams.get("ciudad");
        const tipo = searchParams.get("tipo");

        let apiUrl = "/api/propiedades";
        const queryParams = [];

        if (ciudad) queryParams.push(`ciudad=${ciudad}`);
        if (tipo) queryParams.push(`tipo=${tipo}`);

        if (queryParams.length > 0) {
          apiUrl += `?${queryParams.join("&")}`;
        }

        const response = await fetch(apiUrl);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Error ${response.status}: ${errorData}`);
        }
        const data = await response.json();
        setPropiedades(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPropiedades();
  }, [location.search]);

  // Lógica de paginación
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = propiedades.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="propiedades-loading">Cargando propiedades...</div>;
  }

  if (error) {
    return <div className="propiedades-error">Error: {error}</div>;
  }

  return (
    <div className="propiedades-container">
      <h1 className="propiedades-title">Propiedades Disponibles</h1>

      <div className="propiedades-list">
        {currentProperties.map((propiedad) => (
          <div key={propiedad.id} className="propiedad-card">
            <Link to={`/propiedad/${propiedad.id}`} className="propiedad-link">
              <img
                src={`/uploads/${propiedad.url_imagen_principal}`}
                alt={propiedad.titulo}
                className="propiedad-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/imagen-no-disponible.jpg";
                }}
              />
              <div className="propiedad-info">
                <h2 className="propiedad-title">{propiedad.titulo}</h2>
                <p className="propiedad-description">
                  {propiedad.descripcion.substring(0, 100)}...
                </p>
                <div className="propiedad-features">
                  <p className="propiedad-feature">
                    <strong>Tipo:</strong> {propiedad.tipo}
                  </p>
                  <p className="propiedad-feature">
                    <strong>Ubicación:</strong> {propiedad.ciudad},{" "}
                    {propiedad.pais}
                  </p>
                  <p className="propiedad-feature">
                    <strong>Precio:</strong> {propiedad.precio}{" "}
                    {propiedad.moneda}
                  </p>
                  <p className="propiedad-feature">
                    <strong>Habitaciones:</strong> {propiedad.habitaciones}
                  </p>
                  <p className="propiedad-feature">
                    <strong>Baños:</strong> {propiedad.banios}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {propiedades.length > propertiesPerPage && (
        <div className="propiedades-pagination">
          {Array.from({
            length: Math.ceil(propiedades.length / propertiesPerPage),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => paginate(index + 1)}
              className={`page-button ${
                currentPage === index + 1 ? "active-page-button" : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Propiedades;

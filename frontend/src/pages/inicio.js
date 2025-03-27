import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaStar } from "react-icons/fa";

function Inicio() {
  const [propiedadesDestacadas, setPropiedadesDestacadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ciudades, setCiudades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [filtros, setFiltros] = useState({
    ciudad: "",
    tipo: "",
  });

  // Obtener propiedades destacadas y datos para filtros
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener propiedades destacadas
        const destacadasResponse = await fetch("/api/propiedades/destacadas");
        let destacadasData = destacadasResponse.ok
          ? await destacadasResponse.json()
          : [];

        // Si hay menos de 4, completar con propiedades aleatorias
        if (destacadasData.length < 4) {
          const randomResponse = await fetch(
            `/api/propiedades/random?limit=${4 - destacadasData.length}`
          );
          const randomData = randomResponse.ok
            ? await randomResponse.json()
            : [];
          destacadasData = [...destacadasData, ...randomData];
        }

        setPropiedadesDestacadas(destacadasData.slice(0, 4));

        // Obtener ciudades desde la tabla CIUDADES
        const ciudadesResponse = await fetch("/api/ciudades");
        console.log("Status ciudades:", ciudadesResponse.status);
        const ciudadesData = ciudadesResponse.ok
          ? await ciudadesResponse.json()
          : [];
        setCiudades(ciudadesData);

        // Obtener tipos desde la tabla TIPOS
        const tiposResponse = await fetch("/api/tipos");
        const tiposData = tiposResponse.ok ? await tiposResponse.json() : [];
        setTipos(tiposData);
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Valores actuales de filtros:", filtros); // ← Esto es clave

    // Redirigir a propiedades con los filtros
    window.location.href = `/propiedades?ciudad=${filtros.ciudad}&tipo=${filtros.tipo}`;
  };

  console.log(
    "Consulta propiedad -- ",
    window.location.href,
    "--",
    filtros,
    " <--"
  );

  if (loading) {
    return <div style={styles.loading}>Cargando...</div>;
  }

  console.log("Otro -- ", loading, " <--");

  return (
    <div style={styles.container}>
      {/* Hero Section con imagen al 100% */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Encuentra tu propiedad ideal</h1>

          {/* Buscador */}
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <div style={styles.searchInputGroup}>
              <select
                name="ciudad"
                value={filtros.ciudad}
                onChange={handleFilterChange}
                style={styles.searchInput}
              >
                <option value="">Todas las ciudades</option>
                {ciudades.map((ciudad) => (
                  <option key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre_ciudad}
                  </option>
                ))}
              </select>

              <select
                name="tipo"
                value={filtros.tipo}
                onChange={handleFilterChange}
                style={styles.searchInput}
              >
                <option value="">Todos los tipos</option>
                {tipos.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre_tipo}
                  </option>
                ))}
              </select>

              <button type="submit" style={styles.searchButton}>
                <FaSearch /> Buscar
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Propiedades destacadas */}
      <div style={styles.featuredSection}>
        <h2 style={styles.sectionTitle}>Propiedades Destacadas</h2>
        <p style={styles.sectionSubtitle}>
          Las mejores opciones seleccionadas para ti
        </p>

        <div style={styles.featuredGrid}>
          {propiedadesDestacadas.map((propiedad) => (
            <div key={propiedad.id_propiedad} style={styles.featuredCard}>
              <Link
                to={`/propiedad/${propiedad.id_propiedad}`}
                style={styles.featuredLink}
              >
                <div style={styles.featuredImageContainer}>
                  <img
                    src={`/uploads/${propiedad.url_imagen_principal}`}
                    alt={propiedad.titulo}
                    style={styles.featuredImage}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/imagen-no-disponible.jpg";
                    }}
                  />
                  {propiedad.destacadas && (
                    <div style={styles.featuredBadge}>
                      <FaStar /> Destacada
                    </div>
                  )}
                </div>
                <div style={styles.featuredInfo}>
                  <h3 style={styles.featuredTitle}>{propiedad.titulo}</h3>
                  <p style={styles.featuredLocation}>
                    {propiedad.ciudad}, {propiedad.pais}
                  </p>
                  <p style={styles.featuredPrice}>
                    {propiedad.precio} {propiedad.moneda}
                  </p>
                  <div style={styles.featuredFeatures}>
                    <span>{propiedad.habitaciones} hab.</span>
                    <span>{propiedad.banios} baños</span>
                    <span>{propiedad.dimensiones} m²</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Estilos modernos
const styles = {
  container: {
    maxWidth: "100%",
    margin: 0,
    padding: 0,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#666",
  },
  hero: {
    position: "relative",
    width: "100%",
    height: "70vh",
    minHeight: "500px",
    backgroundImage:
      "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('../fotos/portada1.jpg')",
    backgroundPosition: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    marginBottom: "60px",
  },
  heroContent: {
    textAlign: "center",
    padding: "0 20px",
    maxWidth: "1200px",
    width: "100%",
  },
  heroTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    marginBottom: "30px",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  searchForm: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  searchInputGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
  },
  searchInput: {
    flex: "1 1 200px",
    padding: "15px 20px",
    borderRadius: "30px",
    border: "none",
    fontSize: "16px",
    minWidth: "200px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  searchButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "15px 30px",
    borderRadius: "30px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    ":hover": {
      backgroundColor: "#3e8e41",
      transform: "translateY(-2px)",
    },
  },
  featuredSection: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px 60px",
  },
  sectionTitle: {
    fontSize: "2.2rem",
    fontWeight: "700",
    marginBottom: "10px",
    color: "#2c3e50",
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: "1.1rem",
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: "40px",
  },
  featuredGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
  },
  featuredCard: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    ":hover": {
      transform: "translateY(-10px)",
      boxShadow: "0 15px 30px rgba(0,0,0,0.15)",
    },
  },
  featuredLink: {
    textDecoration: "none",
    color: "inherit",
    display: "block",
    height: "100%",
  },
  featuredImageContainer: {
    position: "relative",
    width: "100%",
    height: "200px",
    overflow: "hidden",
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
    ":hover": {
      transform: "scale(1.05)",
    },
  },
  featuredBadge: {
    position: "absolute",
    top: "15px",
    right: "15px",
    backgroundColor: "#FFD700",
    color: "#333",
    padding: "5px 10px",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
  featuredInfo: {
    padding: "20px",
  },
  featuredTitle: {
    fontSize: "1.3rem",
    fontWeight: "600",
    margin: "0 0 10px",
    color: "#2c3e50",
  },
  featuredLocation: {
    color: "#7f8c8d",
    margin: "0 0 10px",
    fontSize: "14px",
  },
  featuredPrice: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#e74c3c",
    margin: "0 0 15px",
  },
  featuredFeatures: {
    display: "flex",
    gap: "15px",
    color: "#34495e",
    fontSize: "14px",
  },
};

export default Inicio;

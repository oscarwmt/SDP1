import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaStar } from "react-icons/fa";

// Función para formatear números como $00.000.000
const formatCurrency = (value, currency) => {
  if (!value) return `$0 ${currency}`;

  // Formatear el número con separadores de miles
  const formattedValue = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return `${currency} ${formattedValue} `;
};

function Inicio() {
  const [propiedades, setPropiedades] = useState([]); // Cambiado de propiedadesDestacadas a propiedades
  const [loading, setLoading] = useState(true);
  const [ciudades, setCiudades] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [filtros, setFiltros] = useState({
    ciudad: "",
    tipo: "",
  });

  // Obtener todas las propiedades y datos para filtros
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Obtener todas las propiedades
        const propiedadesResponse = await fetch("/api/inicio");
        const propiedadesData = propiedadesResponse.ok
          ? await propiedadesResponse.json()
          : [];
        setPropiedades(propiedadesData);

        // 2. Obtener ciudades
        const ciudadesResponse = await fetch("/api/ciudades");
        const ciudadesData = ciudadesResponse.ok
          ? await ciudadesResponse.json()
          : [];
        setCiudades(ciudadesData);

        // 3. Obtener tipos
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
    window.location.href = `/propiedades?ciudad=${filtros.ciudad}&tipo=${filtros.tipo}`;
  };

  if (loading) {
    return <div style={styles.loading}>Cargando...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Hero Section */}
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

      {/* Propiedades Destacadas */}
      <div style={styles.featuredSection}>
        <h2 style={styles.sectionTitle}>Propiedades Destacadas</h2>
        <p style={styles.sectionSubtitle}></p>

        <div style={styles.featuredGrid}>
          {propiedades.map((propiedad) => (
            <div key={propiedad.id} style={styles.featuredCard}>
              <Link
                to={`/propiedad/${propiedad.id}`}
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
                  {propiedad.destacada === 1 && (
                    <div style={styles.featuredBadge}>
                      <FaStar /> Destacada
                    </div>
                  )}
                </div>
                <div style={styles.featuredInfo}>
                  <h3 style={styles.featuredLocation}>
                    {propiedad.Ntipo} / {propiedad.estado}
                  </h3>
                  <h3 style={styles.featuredTitle}>{propiedad.titulo}</h3>
                  <p style={styles.featuredLocation}>{propiedad.Nciudad}</p>
                  <p style={styles.featuredPrice}>
                    {formatCurrency(propiedad.precio, propiedad.moneda)}
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

// Estilos actualizados
const styles = {
  container: {
    maxWidth: "100%",
    margin: 0,
    padding: 0,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#333",
    overflowX: "hidden",
  },
  hero: {
    position: "relative",
    width: "100vw",
    left: "50%",
    right: "50%",
    marginLeft: "-50vw",
    marginRight: "-50vw",
    height: "70vh",
    minHeight: "500px",
    backgroundImage:
      "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('../fotos/portada1.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
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
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", // Cambiado a 250px
    gap: "20px",
  },
  featuredCard: {
    width: "250px", // Ancho fijo de 250px
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
    backgroundColor: "white",
    ":hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
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
    height: "160px", // Altura reducida
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
    top: "10px",
    right: "10px",
    backgroundColor: "#FFD700",
    color: "#333",
    padding: "3px 8px",
    borderRadius: "15px",
    fontSize: "12px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
  },
  featuredInfo: {
    padding: "15px",
  },
  featuredTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    margin: "0 0 8px",
    color: "#2c3e50",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  featuredLocation: {
    color: "#7f8c8d",
    margin: "0 0 8px",
    fontSize: "12px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  featuredPrice: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#e74c3c",
    margin: "0 0 10px",
  },
  featuredFeatures: {
    display: "flex",
    gap: "10px",
    color: "#34495e",
    fontSize: "12px",
    justifyContent: "space-between",
  },
  loading: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "1.5rem",
  },
};

export default Inicio;

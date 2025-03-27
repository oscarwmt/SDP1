import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FaArrowLeft,
  FaBed,
  FaBath,
  FaCar,
  FaRulerCombined,
} from "react-icons/fa";

// Imagen de placeholder en base64 para evitar problemas de carga
const placeholderImage =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2RkZCI+PHBhdGggZD0iTTE5IDVINUMzLjkgNSAzIDUuOSAzIDd2MTBjMCAxLjEuOSAyIDIgMmgxNGMxLjEgMCAyLS45IDItMlY3YzAtMS4xLS45LTItMi0yem0wIDEySDVWN2gxNHYxMHoiLz48cGF0aCBkPSJNMTAgMTBsLTIuNSAzLjVMOSAxN2w2LTNoOHoiLz48L3N2Zz4=";

function PropiedadDetalle() {
  const { id } = useParams();
  const [propiedad, setPropiedad] = useState(null);
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Obtener datos de la propiedad
        const propiedadResponse = await fetch(`/api/propiedades/${id}`);
        if (!propiedadResponse.ok)
          throw new Error("Error al cargar la propiedad");
        const propiedadData = await propiedadResponse.json();

        // 2. Obtener imágenes adicionales
        const imagenesResponse = await fetch(`/api/propiedades/${id}/imagenes`);
        const imagenesAdicionales = imagenesResponse.ok
          ? await imagenesResponse.json()
          : [];

        // DEPURACIÓN: Mostrar información de imágenes
        console.log("=== DEPURACIÓN DE IMÁGENES ===");
        console.log(
          "Imagen principal (propiedades.url_imagen_principal):",
          propiedadData.url_imagen_principal
        );
        console.log(
          "Imágenes adicionales (imagenes_propiedad.url_imagen):",
          imagenesAdicionales.map((img) => img.url_imagen)
        );

        // 3. Procesar imágenes sin duplicados
        const imagenPrincipal = propiedadData.url_imagen_principal;
        const otrasImagenes = imagenesAdicionales
          .map((img) => img.url_imagen)
          .filter((img) => img && img !== imagenPrincipal); // Eliminar duplicados

        const todasImagenes = [imagenPrincipal, ...otrasImagenes].filter(
          Boolean
        );

        // DEPURACIÓN: Mostrar lista final de imágenes
        console.log("Lista final de imágenes a mostrar:", todasImagenes);
        console.log("==============================");

        setPropiedad(propiedadData);
        setImagenes(todasImagenes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === imagenes.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? imagenes.length - 1 : prev - 1
    );
  };

  if (loading) return <div style={styles.loading}>Cargando propiedad...</div>;
  if (error) return <div style={styles.error}>Error: {error}</div>;
  if (!propiedad)
    return <div style={styles.error}>Propiedad no encontrada</div>;

  return (
    <div style={styles.container}>
      <Link to="/propiedades" style={styles.backButton}>
        <FaArrowLeft /> Volver al listado
      </Link>

      <h1 style={styles.title}>{propiedad.titulo}</h1>

      {/* Galería de imágenes */}
      <div style={styles.galleryContainer}>
        <div style={styles.mainImageContainer}>
          {imagenes.length > 0 ? (
            <img
              src={`/uploads/${imagenes[currentImageIndex]}`}
              alt={`${propiedad.titulo} - Imagen ${currentImageIndex + 1}`}
              style={styles.mainImage}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholderImage;
              }}
            />
          ) : (
            <div style={styles.placeholderImage}>
              <img
                src={placeholderImage}
                alt="Imagen no disponible"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          )}

          {imagenes.length > 1 && (
            <>
              <button onClick={prevImage} style={styles.navButtonLeft}>
                &lt;
              </button>
              <button onClick={nextImage} style={styles.navButtonRight}>
                &gt;
              </button>
              <div style={styles.imageCounter}>
                {currentImageIndex + 1} / {imagenes.length}
              </div>
            </>
          )}
        </div>

        {/* Miniaturas - Renderizado optimizado */}
        {imagenes.length > 1 && (
          <div style={styles.thumbnailContainer}>
            {imagenes.map((img, index) => (
              <div key={index} style={styles.thumbnailWrapper}>
                <img
                  src={`/uploads/${img}`}
                  alt={`Miniatura ${index + 1}`}
                  style={{
                    ...styles.thumbnail,
                    ...(index === currentImageIndex && styles.activeThumbnail),
                  }}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage;
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Información de la propiedad */}
      <div style={styles.infoContainer}>
        <div style={styles.priceContainer}>
          <h2 style={styles.price}>
            {propiedad.precio} {propiedad.moneda}
          </h2>
          <p style={styles.address}>
            {propiedad.direccion}, {propiedad.ciudad}, {propiedad.pais}
          </p>
        </div>

        <div style={styles.features}>
          <div style={styles.feature}>
            <FaBed style={styles.featureIcon} />
            <span>{propiedad.habitaciones} Habitaciones</span>
          </div>
          <div style={styles.feature}>
            <FaBath style={styles.featureIcon} />
            <span>{propiedad.banios} Baños</span>
          </div>
          <div style={styles.feature}>
            <FaCar style={styles.featureIcon} />
            <span>{propiedad.garage ? "Con Garage" : "Sin Garage"}</span>
          </div>
          <div style={styles.feature}>
            <FaRulerCombined style={styles.featureIcon} />
            <span>{propiedad.dimensiones} m²</span>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Descripción</h3>
          <p style={styles.description}>{propiedad.descripcion}</p>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Características</h3>
          <ul style={styles.amenitiesList}>
            {propiedad.caracteristicas?.split(",").map((item, index) => (
              <li key={index} style={styles.amenityItem}>
                {item.trim()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Estilos completos y optimizados
const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    color: "#333",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "20px",
    color: "#2c82c9",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
    transition: "color 0.2s",
    ":hover": {
      color: "#1a5a8a",
    },
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#666",
  },
  error: {
    textAlign: "center",
    padding: "40px",
    color: "#e74c3c",
    fontSize: "18px",
  },
  title: {
    fontSize: "28px",
    marginBottom: "25px",
    color: "#2c3e50",
    fontWeight: "600",
    textAlign: "center",
  },
  galleryContainer: {
    marginBottom: "40px",
    borderRadius: "8px",
    overflow: "hidden",
  },
  mainImageContainer: {
    position: "relative",
    height: "500px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "15px",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
  },
  navButtonLeft: {
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    fontSize: "24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
    ":hover": {
      background: "rgba(0,0,0,0.8)",
    },
  },
  navButtonRight: {
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "50px",
    height: "50px",
    fontSize: "24px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
    ":hover": {
      background: "rgba(0,0,0,0.8)",
    },
  },
  imageCounter: {
    position: "absolute",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    padding: "6px 18px",
    borderRadius: "20px",
    fontSize: "15px",
    fontWeight: "500",
  },
  thumbnailContainer: {
    display: "flex",
    gap: "12px",
    padding: "10px 0",
    overflowX: "auto",
    scrollbarWidth: "none",
    "::-webkit-scrollbar": {
      display: "none",
    },
  },
  thumbnailWrapper: {
    flex: "0 0 auto",
  },
  thumbnail: {
    width: "100px",
    height: "70px",
    objectFit: "cover",
    borderRadius: "6px",
    cursor: "pointer",
    opacity: "0.7",
    transition: "all 0.2s",
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "transparent",
  },
  activeThumbnail: {
    opacity: "1",
    border: "2px solid #2c82c9", // Usamos la propiedad border completa
    boxShadow: "0 2px 8px rgba(44,130,201,0.4)",
  },
  infoContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    padding: "30px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  priceContainer: {
    marginBottom: "25px",
    borderBottom: "1px solid #eee",
    paddingBottom: "20px",
  },
  price: {
    color: "#e74c3c",
    margin: "0 0 8px 0",
    fontSize: "32px",
    fontWeight: "700",
  },
  address: {
    color: "#7f8c8d",
    margin: "0",
    fontSize: "17px",
  },
  features: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "20px",
    marginBottom: "30px",
  },
  feature: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "16px",
    color: "#34495e",
  },
  featureIcon: {
    color: "#2c82c9",
    fontSize: "18px",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    color: "#2c3e50",
    borderBottom: "1px solid #eee",
    paddingBottom: "12px",
    marginBottom: "18px",
    fontSize: "20px",
    fontWeight: "600",
  },
  description: {
    lineHeight: "1.7",
    color: "#34495e",
    fontSize: "16px",
  },
  amenitiesList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    listStyle: "none",
    padding: "0",
    margin: "0",
  },
  amenityItem: {
    backgroundColor: "#ecf0f1",
    padding: "10px 15px",
    borderRadius: "6px",
    fontSize: "15px",
    color: "#2c3e50",
  },
};

export default PropiedadDetalle;

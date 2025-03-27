import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import "../styles/EditarPropiedad.css";

function EditarPropiedad() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  // Estados del formulario
  const [formData, setFormData] = useState({
    id: "",
    titulo: "",
    descripcion: "",
    tipo: 1,
    estado: "arriendo",
    ubicacion: "",
    habitaciones: "",
    banios: "",
    pisos: "",
    garage: "",
    dimensiones: "",
    precio: "",
    moneda: "UF",
    ciudad: 1,
    propietario: "",
    telefono_propietario: "",
  });

  // Estados para imágenes
  const [imagenes, setImagenes] = useState([]);
  const [imagenPrincipal, setImagenPrincipal] = useState(null);
  const [imagenesExistentes, setImagenesExistentes] = useState([]);
  const [imagenesAEliminar, setImagenesAEliminar] = useState([]);
  const [tiposPropiedad, setTiposPropiedad] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Verificar token antes de hacer las peticiones
        if (!token) {
          navigate("/login", {
            state: {
              from: `/propiedades/${id}/editar`,
              message: "Debes iniciar sesión para continuar",
            },
          });
          return;
        }

        const [
          ciudadesResponse,
          tiposResponse,
          propiedadResponse,
          imagenesResponse,
        ] = await Promise.all([
          axios.get("http://localhost:5001/api/ciudades"),
          axios.get("http://localhost:5001/api/tipos"),
          axios.get(`http://localhost:5001/api/propiedades/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`http://localhost:5001/api/propiedades/${id}/imagenes`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const propiedadData = propiedadResponse.data;
        let imagenesData = imagenesResponse.data.filter(
          (img) => img.url_imagen
        );

        // Configurar estados
        setCiudades(ciudadesResponse.data);
        setTiposPropiedad(tiposResponse.data);
        setFormData({
          ...propiedadData,
          ciudad: parseInt(propiedadData.ciudad) || 1,
          habitaciones: propiedadData.habitaciones || "",
          banios: propiedadData.banios || "",
          pisos: propiedadData.pisos || "",
          precio: propiedadData.precio || "",
        });

        setImagenesExistentes(imagenesData);

        // Establecer imagen principal
        const imgPrincipal = imagenesData.find((img) =>
          img.url_imagen.includes(propiedadData.url_imagen_principal)
        );
        setImagenPrincipal(imgPrincipal || null);

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", {
            state: {
              from: `/propiedades/${id}/editar`,
              message:
                error.response.data?.error === "Token expirado"
                  ? "Tu sesión ha expirado. Por favor inicia sesión nuevamente."
                  : "Debes iniciar sesión para continuar",
            },
          });
        } else {
          setError(error.response?.data?.message || error.message);
        }
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar selección de nuevas imágenes
  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImagenes =
      imagenes.length +
      files.length +
      imagenesExistentes.length -
      imagenesAEliminar.length;

    if (totalImagenes > 10) {
      alert("No puedes subir más de 10 imágenes en total");
      return;
    }

    setImagenes((prev) => [...prev, ...files]);
  };

  // Función para construir la URL correcta de la imagen
  const getImageUrl = (imagen) => {
    if (!imagen?.url_imagen) return "";

    // Si ya es una URL completa (http/https)
    if (imagen.url_imagen.startsWith("http")) {
      return imagen.url_imagen;
    }

    // Extraer solo el nombre del archivo
    const fileName = imagen.url_imagen.split("/").pop();
    return `http://localhost:5001/uploads/${fileName}`;
  };

  // Manejar errores de carga de imágenes
  const handleImageError = useCallback((e) => {
    e.target.onerror = null; // Prevenir bucles
    e.target.style.display = "none";

    const container = e.target.parentElement;
    if (container && !container.querySelector(".imagen-error")) {
      const errorDiv = document.createElement("div");
      errorDiv.className = "imagen-error";
      errorDiv.innerHTML = `
        <div class="imagen-error-contenido">
          <span>⚠️</span>
          <p>Imagen no disponible</p>
        </div>
      `;
      container.appendChild(errorDiv);
    }
  }, []);

  // Eliminar imagen existente
  const handleEliminarImagen = (index) => {
    const imagen = imagenesExistentes[index];
    setImagenesAEliminar((prev) => [...prev, imagen.id]);
    setImagenesExistentes((prev) => prev.filter((_, i) => i !== index));

    if (imagen === imagenPrincipal) {
      setImagenPrincipal(null);
    }
  };

  // Eliminar imagen nueva
  const handleEliminarImagenNueva = (index) => {
    const imagen = imagenes[index];
    setImagenes((prev) => prev.filter((_, i) => i !== index));

    if (imagen === imagenPrincipal) {
      setImagenPrincipal(null);
    }
  };

  // Seleccionar imagen principal
  const handleSeleccionarImagenPrincipal = (imagen) => {
    // Verifica si es una imagen nueva (File object) o existente
    if (imagen instanceof File) {
      // Valida el tipo y tamaño para nuevas imágenes
      if (!["image/jpeg", "image/png"].includes(imagen.type)) {
        alert("Solo se permiten imágenes JPEG o PNG");
        return;
      }
      if (imagen.size > 5 * 1024 * 1024) {
        alert("La imagen es demasiado grande (máximo 5MB)");
        return;
      }
    }
    setImagenPrincipal(imagen);

    if (imagen instanceof File) {
      setFormData((prev) => ({ ...prev, url_imagen_principal: imagen.name }));
    } else if (imagen?.url_imagen) {
      setFormData((prev) => ({
        ...prev,
        url_imagen_principal: imagen.url_imagen,
      }));
    }
  };

  // Renderizar imágenes existentes
  const renderImagenesExistentes = () => {
    return imagenesExistentes.map((imagen, index) => (
      <div key={`existente-${imagen.id}`} className="imagen-item">
        <img
          src={getImageUrl(imagen)}
          alt={`Imagen ${index + 1}`}
          onError={handleImageError}
          className={imagen === imagenPrincipal ? "imagen-principal" : ""}
        />
        <p className="nombre-imagen">
          {imagen.url_imagen?.split("/").pop() || "Imagen"}
        </p>
        <div className="imagen-acciones">
          <button
            type="button"
            onClick={() => handleEliminarImagen(index)}
            className="btn-eliminar"
          >
            Eliminar
          </button>
          <button
            type="button"
            onClick={() => handleSeleccionarImagenPrincipal(imagen)}
            className={
              imagen === imagenPrincipal ? "btn-principal" : "btn-seleccionar"
            }
          >
            {imagen === imagenPrincipal ? "Principal" : "Seleccionar"}
          </button>
        </div>
      </div>
    ));
  };

  // Renderizar imágenes nuevas
  const renderImagenesNuevas = () => {
    return imagenes.map((imagen, index) => (
      <div key={`nueva-${index}`} className="imagen-item">
        <img
          src={URL.createObjectURL(imagen)}
          alt={`Nueva imagen ${index + 1}`}
          className={imagen === imagenPrincipal ? "imagen-principal" : ""}
        />
        <p className="nombre-imagen">{imagen.name}</p>
        <div className="imagen-acciones">
          <button
            type="button"
            onClick={() => handleEliminarImagenNueva(index)}
            className="btn-eliminar"
          >
            Eliminar
          </button>
          <button
            type="button"
            onClick={() => handleSeleccionarImagenPrincipal(imagen)}
            className={
              imagen === imagenPrincipal ? "btn-principal" : "btn-seleccionar"
            }
          >
            {imagen === imagenPrincipal ? "Principal" : "Seleccionar"}
          </button>
        </div>
      </div>
    ));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Validación básica
    if (
      !imagenPrincipal &&
      imagenes.length === 0 &&
      imagenesExistentes.length - imagenesAEliminar.length === 0
    ) {
      setSubmitError("Debe haber al menos una imagen");
      return;
    }

    // Verificar si el token existe
    if (!token) {
      navigate("/login", {
        state: {
          from: `/propiedades/${id}/editar`,
          message: "Debes iniciar sesión para continuar",
        },
      });
      return;
    }

    const formDataToSend = new FormData();

    // Agregar datos del formulario
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null && formData[key] !== undefined) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Agregar imágenes secundarias
    imagenes.forEach((file) => {
      formDataToSend.append("imagenesSecundarias", file); // Nombre sincronizado con backend
    });

    // Manejar imagen principal
    if (imagenPrincipal) {
      if (imagenPrincipal instanceof File) {
        formDataToSend.append("imagenPrincipal", imagenPrincipal);
        // AGREGAR esta línea:
        formDataToSend.append("url_imagen_principal", imagenPrincipal.name);
      } else if (imagenPrincipal.id) {
        formDataToSend.append("imagen_principal_id", imagenPrincipal.id);
        // AGREGAR esta línea:
        formDataToSend.append(
          "url_imagen_principal",
          imagenPrincipal.url_imagen
        );
      }
    }

    // Agregar imágenes a eliminar
    if (imagenesAEliminar.length > 0) {
      formDataToSend.append(
        "imagenesAEliminar",
        JSON.stringify(imagenesAEliminar)
      );
    }

    try {
      const response = await axios.put(
        `http://localhost:5001/api/propiedades/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(formDataToSend, response);
      if (response.data.success) {
        navigate(`/propiedades/${id}`, {
          state: {
            success: true,
            message: "Propiedad actualizada correctamente",
          },
        });
      }
    } catch (error) {
      let errorMsg = "Error al guardar cambios";
      if (error.response) {
        if (error.response.status === 413) {
          errorMsg = "Las imágenes exceden el tamaño máximo (5MB)";
        } else if (
          error.response.status === 401 &&
          error.response.data?.error === "Token expirado"
        ) {
          // Token expirado - redirigir a login
          localStorage.removeItem("token");
          navigate("/login", {
            state: {
              from: `/propiedades/${id}/editar`,
              message:
                "Tu sesión ha expirado. Por favor inicia sesión nuevamente.",
            },
          });
          return;
        } else if (error.response.data?.error) {
          errorMsg = error.response.data.error;
        }
      }
      setSubmitError(errorMsg);
      console.error("Error al guardar:", error.response?.data || error.message);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="editar-propiedad-container">
      <h1 className="titulo-principal">Editar Propiedad</h1>

      {submitError && <div className="alert alert-danger">{submitError}</div>}

      <form onSubmit={handleSubmit} className="formulario-edicion">
        {/* Sección de información básica */}
        <section className="seccion-formulario">
          <h2 className="titulo-seccion">Información Básica</h2>

          <div className="form-group">
            <label>Título:</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Propiedad:</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                {tiposPropiedad.map((tipo) => (
                  <option key={tipo.id} value={tipo.id}>
                    {tipo.nombre_tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Estado:</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                required
              >
                <option value="arriendo">Arriendo</option>
                <option value="venta">Venta</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Dirección:</label>
            <input
              type="text"
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              required
            />
          </div>
        </section>

        {/* Sección de características */}
        <section className="seccion-formulario">
          <h2 className="titulo-seccion">Características</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Dormitorios:</label>
              <input
                type="number"
                name="habitaciones"
                value={formData.habitaciones}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Baños:</label>
              <input
                type="number"
                name="banios"
                value={formData.banios}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Pisos:</label>
              <input
                type="number"
                name="pisos"
                value={formData.pisos}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Estacionamiento:</label>
              <select
                name="garage"
                value={formData.garage}
                onChange={handleChange}
              >
                <option value="Si">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Metros cuadrados:</label>
            <input
              type="text"
              name="dimensiones"
              value={formData.dimensiones}
              onChange={handleChange}
            />
          </div>
        </section>

        {/* Sección de precio */}
        <section className="seccion-formulario">
          <h2 className="titulo-seccion">Precio</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Valor:</label>
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Moneda:</label>
              <select
                name="moneda"
                value={formData.moneda}
                onChange={handleChange}
                required
              >
                <option value="UF">UF</option>
                <option value="CLP">Pesos Chilenos</option>
              </select>
            </div>
          </div>
        </section>

        {/* Sección de ubicación */}
        <section className="seccion-formulario">
          <h2 className="titulo-seccion">Ubicación</h2>

          <div className="form-group">
            <label>Ciudad:</label>
            <select
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
            >
              {ciudades.map((ciudad) => (
                <option key={ciudad.id} value={ciudad.id}>
                  {ciudad.nombre_ciudad}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Sección de contacto */}
        <section className="seccion-formulario">
          <h2 className="titulo-seccion">Contacto</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Nombre Propietario:</label>
              <input
                type="text"
                name="propietario"
                value={formData.propietario}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Teléfono:</label>
              <input
                type="text"
                name="telefono_propietario"
                value={formData.telefono_propietario}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Sección de imágenes */}
        <section className="seccion-formulario">
          <h2 className="titulo-seccion">Imágenes</h2>

          <div className="form-group">
            <label>Subir nuevas imágenes (Máximo 10 en total):</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagenesChange}
              disabled={
                imagenes.length +
                  imagenesExistentes.length -
                  imagenesAEliminar.length >=
                10
              }
            />
            <small>
              {10 -
                (imagenes.length +
                  imagenesExistentes.length -
                  imagenesAEliminar.length)}{" "}
              imágenes disponibles
            </small>
          </div>

          {/* Galería de imágenes existentes */}
          <div className="galeria-imagenes">
            <h3>Imágenes existentes</h3>
            {imagenesExistentes.length > 0 ? (
              <div className="contenedor-imagenes">
                {renderImagenesExistentes()}
              </div>
            ) : (
              <p className="sin-imagenes">No hay imágenes existentes</p>
            )}
          </div>

          {/* Galería de nuevas imágenes */}
          <div className="galeria-imagenes">
            <h3>Nuevas imágenes</h3>
            {imagenes.length > 0 ? (
              <div className="contenedor-imagenes">
                {renderImagenesNuevas()}
              </div>
            ) : (
              <p className="sin-imagenes">No hay nuevas imágenes</p>
            )}
          </div>
        </section>

        <div className="acciones-formulario">
          <button type="submit" className="btn-guardar">
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditarPropiedad;

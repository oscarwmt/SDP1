import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function AgregarPropiedad() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  // Estado del formulario
  const [formData, setFormData] = useState({
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
  const [imagenPrincipal, setImagenPrincipal] = useState(null);
  const [imagenesSecundarias, setImagenesSecundarias] = useState([]);
  const [tiposPropiedad, setTiposPropiedad] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar datos iniciales (tipos y ciudades)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [tiposResponse, ciudadesResponse] = await Promise.all([
          axios.get("http://localhost:5001/api/tipos"),
          axios.get("http://localhost:5001/api/ciudades"),
        ]);

        setTiposPropiedad(tiposResponse.data);
        setCiudades(ciudadesResponse.data);
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
        setError("Error al cargar datos iniciales");
      }
    };

    fetchInitialData();
  }, []);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar selección de imagen principal
  const handleImagenPrincipalChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen (JPEG, PNG)");
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen principal no debe exceder los 5MB");
      return;
    }

    setImagenPrincipal(file);
    setError(null);
  };

  // Manejar selección de imágenes secundarias
  const handleImagenesSecundariasChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Validar tipos de archivo
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length) {
      setError("Solo se permiten archivos de imagen (JPEG, PNG)");
      return;
    }

    // Validar tamaño (5MB máximo por imagen)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length) {
      setError("Las imágenes no deben exceder los 5MB cada una");
      return;
    }

    // Validar límite de 10 imágenes en total
    if (imagenesSecundarias.length + files.length > 10) {
      setError("Máximo 10 imágenes secundarias permitidas");
      return;
    }

    setImagenesSecundarias((prev) => [...prev, ...files]);
    setError(null);
  };

  // Eliminar imagen secundaria
  const handleEliminarImagenSecundaria = (index) => {
    setImagenesSecundarias((prev) => prev.filter((_, i) => i !== index));
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!imagenPrincipal) {
      setError("Debe seleccionar una imagen principal");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Agregar campos del formulario
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Agregar imagen principal con el nombre modificado
      // const nombreArchivo = `uploads/${imagenPrincipal.name}`;
      formDataToSend.append("imagenPrincipal", imagenPrincipal);
      // formDataToSend.append("nombreArchivo", nombreArchivo); // Envía el nombre modificado

      // Agregar imágenes secundarias
      imagenesSecundarias.forEach((file) => {
        formDataToSend.append("imagenesSecundarias", file);
      });

      // Enviar datos al backend
      const response = await axios.post(
        "http://localhost:5001/api/propiedades",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.id) {
        setSuccess("Propiedad creada exitosamente");
        setTimeout(() => {
          navigate(`/propiedades/${response.data.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error("Error al crear propiedad:", err);
      setError(err.response?.data?.message || "Error al crear la propiedad");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agregar-propiedad-container">
      <h1>Agregar Nueva Propiedad</h1>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Sección de información básica */}
        <section className="form-section">
          <h2>Información Básica</h2>

          <div className="form-group">
            <label>Título*:</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Descripción*:</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Propiedad*:</label>
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
              <label>Estado*:</label>
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
            <label>Dirección*:</label>
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
        <section className="form-section">
          <h2>Características</h2>

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
        <section className="form-section">
          <h2>Precio</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Valor*:</label>
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
              <label>Moneda*:</label>
              <select
                name="moneda"
                value={formData.moneda}
                onChange={handleChange}
                required
              >
                <option value="UF">UF</option>
                <option value="$">Pesos Chilenos</option>
              </select>
            </div>
          </div>
        </section>

        {/* Sección de ubicación */}
        <section className="form-section">
          <h2>Ubicación</h2>

          <div className="form-group">
            <label>Ciudad*:</label>
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
        <section className="form-section">
          <h2>Contacto</h2>

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
        <section className="form-section">
          <h2>Imágenes</h2>

          <div className="form-group">
            <label>Imagen Principal* (Máx. 5MB):</label>
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={handleImagenPrincipalChange}
              required
            />
            {imagenPrincipal && (
              <div className="image-preview">
                <img
                  src={URL.createObjectURL(imagenPrincipal)}
                  alt="Vista previa"
                />
                <p>{imagenPrincipal.name}</p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Imágenes Secundarias (Máx. 10, 5MB cada una):</label>
            <input
              type="file"
              multiple
              accept="image/jpeg, image/png"
              onChange={handleImagenesSecundariasChange}
            />
            <small>
              {10 - imagenesSecundarias.length} imágenes disponibles
            </small>

            {imagenesSecundarias.length > 0 && (
              <div className="secondary-images-container">
                {imagenesSecundarias.map((img, index) => (
                  <div key={index} className="secondary-image-item">
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Imagen ${index + 1}`}
                    />
                    <p>{img.name}</p>
                    <button
                      type="button"
                      onClick={() => handleEliminarImagenSecundaria(index)}
                      className="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Guardando..." : "Guardar Propiedad"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AgregarPropiedad;

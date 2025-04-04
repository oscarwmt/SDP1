import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import axios from "axios"; // Importa axios para las peticiones HTTP
import "../styles/Contacto.css";

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    asunto: "Consulta general",
    mensaje: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "Nombre es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "Email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email no válido";
    }
    if (!formData.mensaje.trim()) newErrors.mensaje = "Mensaje es requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(""); // Limpiar errores anteriores

    if (validateForm()) {
      setIsSubmitting(true);

      try {
        // Enviar datos al backend
        const response = await axios.post("/api/contacto", formData);

        if (response.data.success) {
          setSubmitSuccess(true);
          setFormData({
            nombre: "",
            email: "",
            telefono: "",
            asunto: "Consulta general",
            mensaje: "",
          });
        } else {
          setSubmitError(response.data.message || "Error al enviar el mensaje");
        }
      } catch (error) {
        console.error("Error al enviar:", error);
        setSubmitError(
          error.response?.data?.message ||
            "Error al conectar con el servidor. Por favor intenta más tarde."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="contacto-container">
      <div className="contacto-header">
        <h1>Contáctanos</h1>
        <p>
          Estamos aquí para ayudarte. Completa el formulario o usa nuestros
          datos directos.
        </p>
      </div>

      <div className="contacto-content">
        <div className="formulario-container">
          <form onSubmit={handleSubmit} className="contacto-form">
            {submitSuccess ? (
              <div className="success-message">
                <FaPaperPlane className="success-icon" />
                <h3>¡Mensaje enviado con éxito!</h3>
                <p>Nos pondremos en contacto contigo pronto.</p>
                <button
                  type="button"
                  className="btn-new-message"
                  onClick={() => setSubmitSuccess(false)}
                >
                  Enviar nuevo mensaje
                </button>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre completo*</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className={errors.nombre ? "error" : ""}
                  />
                  {errors.nombre && (
                    <span className="error-message">{errors.nombre}</span>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email*</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={errors.email ? "error" : ""}
                    />
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="asunto">Asunto</label>
                  <select
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                  >
                    <option value="Consulta general">Consulta general</option>
                    <option value="Visita propiedad">
                      Visitar una propiedad
                    </option>
                    <option value="Venta propiedad">
                      Vendo/Arriendo mi propiedad
                    </option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje*</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    rows="5"
                    className={errors.mensaje ? "error" : ""}
                  ></textarea>
                  {errors.mensaje && (
                    <span className="error-message">{errors.mensaje}</span>
                  )}
                </div>
                {submitError && (
                  <div className="error-message server-error">
                    {submitError}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                </button>
              </>
            )}
          </form>
        </div>

        <div className="info-container">
          <div className="contacto-info">
            <h2>Información de contacto</h2>

            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <h3>Dirección</h3>
                <p>Santo Domingo, V región, Chile</p>
              </div>
            </div>

            <div className="info-item">
              <FaPhone className="info-icon" />
              <div>
                <h3>Teléfonos</h3>
                <p>+56 9 6818 5099</p>
              </div>
            </div>

            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <div>
                <h3>Email</h3>
                <p>contacto@sdpropiedades.cl</p>
              </div>
            </div>

            <div className="info-item">
              <FaClock className="info-icon" />
              <div>
                <h3>Horario de atención</h3>
                <p>Lunes a Viernes: 9:00 - 18:00</p>
                <p>Sábados: 10:00 - 14:00</p>
              </div>
            </div>
          </div>

          <div className="mapa-container">
            <h2>Nuestra ubicación</h2>
            <div className="mapa-wrapper">
              <iframe
                title="Ubicación de la inmobiliaria"
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3321.457083979155!2d-71.62689128713716!3d-33.645316507409746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1ses-419!2scl!4v1743196657431!5m2!1ses-419!2scl"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;

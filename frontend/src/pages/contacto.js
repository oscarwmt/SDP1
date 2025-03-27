import React, { useState } from "react";

function Contacto() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("/api/contacto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => alert(data.message));
  };

  return (
    <div>
      <h1>Contacto</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <textarea
          placeholder="Mensaje"
          value={formData.mensaje}
          onChange={(e) =>
            setFormData({ ...formData, mensaje: e.target.value })
          }
        />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}

export default Contacto;

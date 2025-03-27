import React, { useState, useEffect } from "react";

function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    usuario: "",
    password: "",
    email: "",
  });

  // Obtener la lista de usuarios
  useEffect(() => {
    fetch("/api/usuarios")
      .then((response) => response.json())
      .then((data) => setUsuarios(data))
      .catch((error) => console.error("Error al obtener usuarios:", error));
  }, []);

  // Manejar cambios en el formulario de agregar usuario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario({ ...nuevoUsuario, [name]: value });
  };

  // Agregar un nuevo usuario
  const agregarUsuario = () => {
    fetch("/api/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoUsuario),
    })
      .then((response) => response.json())
      .then((data) => {
        setUsuarios([...usuarios, data]); // Agregar el nuevo usuario a la lista
        setMostrarFormulario(false); // Ocultar el formulario
        setNuevoUsuario({ nombre: "", usuario: "", password: "", email: "" }); // Limpiar el formulario
      })
      .catch((error) => console.error("Error al agregar usuario:", error));
  };

  // Editar un usuario existente
  const editarUsuario = (usuario) => {
    setUsuarioEditando(usuario);
  };

  // Guardar los cambios del usuario editado
  const guardarCambios = () => {
    fetch(`/api/usuarios/${usuarioEditando.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuarioEditando),
    })
      .then((response) => response.json())
      .then((data) => {
        setUsuarios(usuarios.map((u) => (u.id === data.id ? data : u))); // Actualizar la lista de usuarios
        setUsuarioEditando(null); // Cerrar el formulario de edición
      })
      .catch((error) => console.error("Error al editar usuario:", error));
  };

  // Eliminar un usuario
  const eliminarUsuario = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este usuario?")) {
      fetch(`/api/usuarios/${id}`, {
        method: "DELETE",
      })
        .then(() => {
          setUsuarios(usuarios.filter((u) => u.id !== id)); // Eliminar el usuario de la lista
        })
        .catch((error) => console.error("Error al eliminar usuario:", error));
    }
  };

  return (
    <div>
      <h2>Gestión de Usuarios</h2>

      {/* Botón para mostrar el formulario de agregar usuario */}
      <button onClick={() => setMostrarFormulario(true)}>
        Agregar Usuario
      </button>

      {/* Formulario para agregar un nuevo usuario */}
      {mostrarFormulario && (
        <div>
          <h3>Agregar Nuevo Usuario</h3>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={nuevoUsuario.nombre}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="usuario"
            placeholder="Usuario"
            value={nuevoUsuario.usuario}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={nuevoUsuario.password}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={nuevoUsuario.email}
            onChange={handleInputChange}
          />
          <button onClick={agregarUsuario}>Guardar</button>
          <button onClick={() => setMostrarFormulario(false)}>Cancelar</button>
        </div>
      )}

      {/* Formulario para editar un usuario existente */}
      {usuarioEditando && (
        <div>
          <h3>Editar Usuario</h3>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={usuarioEditando.nombre}
            onChange={(e) =>
              setUsuarioEditando({ ...usuarioEditando, nombre: e.target.value })
            }
          />
          <input
            type="text"
            name="usuario"
            placeholder="Usuario"
            value={usuarioEditando.usuario}
            onChange={(e) =>
              setUsuarioEditando({
                ...usuarioEditando,
                usuario: e.target.value,
              })
            }
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={usuarioEditando.email}
            onChange={(e) =>
              setUsuarioEditando({ ...usuarioEditando, email: e.target.value })
            }
          />
          <button onClick={guardarCambios}>Guardar</button>
          <button onClick={() => setUsuarioEditando(null)}>Cancelar</button>
        </div>
      )}

      {/* Tabla de usuarios */}
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Usuario</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.nombre}</td>
              <td>{usuario.usuario}</td>
              <td>{usuario.email}</td>
              <td>
                <button onClick={() => editarUsuario(usuario)}>Editar</button>
                <button onClick={() => eliminarUsuario(usuario.id)}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UsuariosAdmin;

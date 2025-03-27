import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // <-- Uso correcto del hook useLocation
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "/api/login",
        {
          usuario,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Guardar token y datos de usuario
      localStorage.setItem("token", response.data.token);
      login(response.data.token, response.data.usuario);

      // Redirigir a admin o a la ruta previa usando location del hook
      const from = location.state?.from?.pathname || "/admin";
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setError(
        error.response?.data?.error ||
          "Usuario o contraseña incorrectos. Por favor intente nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Iniciar Sesión</h2>

        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="usuario" className="form-label">
              Usuario:
            </label>
            <input
              id="usuario"
              type="text"
              className="form-control"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña:
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span className="ms-2">Iniciando sesión...</span>
              </>
            ) : (
              "Ingresar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;

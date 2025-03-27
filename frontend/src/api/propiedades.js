// frontend/src/api/propiedades.js
import { API_BASE_URL, MAX_IMAGENES } from "../config";

export const fetchPropiedad = async (id) => {
  const response = await fetch(`${API_BASE_URL}/propiedades/${id}`);
  if (!response.ok) throw new Error("Error al obtener propiedad");
  return response.json();
};

export const updatePropiedad = async (id, formData) => {
  const response = await fetch(`${API_BASE_URL}/propiedades/${id}`, {
    method: "PUT",
    body: formData,
  });
  if (!response.ok) throw new Error("Error al actualizar propiedad");
  return response.json();
};

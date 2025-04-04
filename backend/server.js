//server.js;
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs").promises;
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 5001;

// Middlewares esenciales
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  console.log(`📨 Petición recibida: ${req.method} ${req.url}`);
  next();
});
// Agrega esto como PRIMER middleware (antes de las rutas)
app.use((req, res, next) => {
  console.log(`📨 Petición recibida: ${req.method} ${req.url}`);
  next();
});

/* 1. Configuración inicial */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* 2. Conexión a MySQL */
const pool = mysql.createPool({
  host: "localhost",
  user: "sdpropie_sdp",
  password: "Ticex2021",
  database: "sdpropie_sdp",
  port: 3307,
});

/* 3. Configuración de Multer */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter,
});

/* 4. Middleware de autenticación */
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, "secreto");
    const [user] = await pool.query(
      "SELECT id, usuario, rol FROM usuarios WHERE id = ?",
      [decoded.id]
    );

    if (!user.length) {
      return res.status(403).json({ error: "Usuario no encontrado" });
    }

    req.user = {
      id: user[0].id,
      usuario: user[0].usuario,
      rol: user[0].rol,
    };

    next();
  } catch (err) {
    console.error("Error en autenticación:", err);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expirado" });
    }

    return res.status(403).json({ error: "Token inválido" });
  }
};

/* 5. Middleware de administrador */
const adminOnly = (req, res, next) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({
      error: "Se requieren privilegios de administrador",
    });
  }
  next();
};

/* 6. Endpoints de autenticación */
app.post("/api/login", async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const [results] = await pool.query(
      "SELECT id, usuario, password, rol FROM usuarios WHERE usuario = ?",
      [usuario]
    );

    if (results.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, rol: user.rol },
      "secreto",
      { expiresIn: "1h" }
    );

    res.json({
      token,
      usuario: {
        id: user.id,
        nombre: user.usuario,
        rol: user.rol,
      },
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor" });
  }
});

app.get("/api/check-session", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

app.get("/api/verify-token", authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

/* 7. Endpoints de propiedades */
app.get("/api/propiedades", async (req, res) => {
  let connection;
  try {
    const { ciudad, tipo } = req.query;

    // Obtener conexión del pool
    connection = await pool.getConnection();

    // Construir consulta base
    let sql =
      "SELECT p.*, t.nombre_tipo AS tipo_propiedad, c.id AS ciudad_id, c.nombre_ciudad AS ciudad, pa.nombre_pais AS pais ";
    sql += "FROM propiedades p ";
    sql += "JOIN tipos t ON p.tipo = t.id ";
    sql += "JOIN ciudades c ON p.ciudad = c.id ";
    sql += "JOIN paises pa ON p.pais = pa.id";
    [req.params.id];
    const params = [];

    // Agregar filtros si existen
    if (ciudad) {
      sql += " AND ciudad = ?";
      params.push(ciudad);
    }

    if (tipo) {
      sql += " AND tipo = ?";
      params.push(tipo);
    }

    // Ejecutar consulta
    const [rows] = await connection.query(sql, params);
    console.log("QUERY -->", sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Error en /api/propiedades:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener propiedades",
      error: error.message,
    });
  } finally {
    // Liberar conexión
    if (connection) connection.release();
  }
});

app.get("/api/propiedades/:id", async (req, res) => {
  try {
    const [results] = await pool.query(
      `SELECT p.*, t.nombre_tipo AS tipo_propiedad, c.id AS ciudad_id, c.nombre_ciudad AS ciudad, pa.nombre_pais AS pais
      FROM propiedades p
      JOIN tipos t ON p.tipo = t.id
      JOIN ciudades c ON p.ciudad = c.id
      JOIN paises pa ON p.pais = pa.id
      WHERE p.id = ?`,
      [req.params.id]
    );

    if (results.length === 0) {
      return res.status(404).json({ error: "Propiedad no encontrada" });
    }

    const propiedad = results[0];
    propiedad.ciudad = propiedad.ciudad_id;
    delete propiedad.ciudad_id;

    res.json(propiedad);
  } catch (err) {
    console.error("Error al obtener la propiedad:", err);
    res.status(500).json({ error: "Error al obtener la propiedad" });
  }
});

app.get("/api/propiedades/:id/imagenes", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT id, url_imagen FROM imagenes_propiedad WHERE propiedad_id = ?",
      [req.params.id]
    );
    res.json(results);
  } catch (err) {
    console.error("Error al obtener imágenes:", err);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
});

/* 8. Endpoints protegidos (requieren autenticación) */
// Validación para asegurar que no se envíen rutas completas

app.post(
  "/api/propiedades",
  authenticateToken,
  adminOnly,
  upload.fields([
    { name: "imagenPrincipal", maxCount: 1 },
    { name: "imagenesSecundarias", maxCount: 10 },
  ]),
  async (req, res) => {
    if (
      req.body.url_imagen_principal &&
      req.body.url_imagen_principal.includes("/")
    ) {
      return res.status(400).json({
        error: "Solo se permite el nombre del archivo, no la ruta completa",
      });
    }
    try {
      const {
        titulo,
        descripcion,
        tipo,
        estado,
        ubicacion,
        habitaciones,
        banios,
        pisos,
        garage,
        dimensiones,
        precio,
        moneda,
        ciudad,
        propietario,
        telefono_propietario,
      } = req.body;

      const ciudadId = parseInt(ciudad);
      if (isNaN(ciudadId)) {
        return res
          .status(400)
          .json({ error: "El ID de ciudad debe ser un número" });
      }

      let urlImagenPrincipal = null;
      if (req.files["imagenPrincipal"]?.[0]) {
        urlImagenPrincipal = req.files["imagenPrincipal"][0].filename;
      }

      const [result] = await pool.query(
        `INSERT INTO propiedades (
        titulo, descripcion, tipo, estado, ubicacion, habitaciones,
        banios, pisos, garage, dimensiones, precio, moneda,
        url_imagen_principal, pais, ciudad, propietario, telefono_propietario, fecha_alta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          titulo,
          descripcion,
          tipo,
          estado,
          ubicacion,
          habitaciones,
          banios,
          pisos,
          garage,
          dimensiones,
          precio,
          moneda,
          urlImagenPrincipal,
          1,
          ciudadId,
          propietario,
          telefono_propietario,
          new Date().toISOString().slice(0, 10),
        ]
      );

      const propiedadId = result.insertId;

      if (req.files["imagenesSecundarias"]) {
        const imagenesValues = req.files["imagenesSecundarias"].map((file) => [
          propiedadId,
          file.filename,
        ]);

        await pool.query(
          "INSERT INTO imagenes_propiedad (propiedad_id, url_imagen) VALUES ?",
          [imagenesValues]
        );
      }

      res.status(201).json({
        message: "Propiedad agregada correctamente",
        id: propiedadId,
      });
    } catch (err) {
      console.error("Error al agregar propiedad:", err);
      res.status(500).json({ error: "Error al agregar propiedad" });
    }
  }
);

app.put(
  "/api/propiedades/:id",
  authenticateToken,
  adminOnly,
  upload.fields([
    { name: "imagenPrincipal", maxCount: 1 },
    { name: "imagenesSecundarias", maxCount: 10 },
  ]),
  async (req, res) => {
    if (
      req.body.url_imagen_principal &&
      req.body.url_imagen_principal.includes("/")
    ) {
      return res.status(400).json({
        error: "Solo se permite el nombre del archivo, no la ruta completa",
      });
    }
    try {
      const propiedadId = req.params.id;
      const {
        titulo,
        descripcion,
        tipo,
        estado,
        ubicacion,
        habitaciones,
        banios,
        pisos,
        garage,
        dimensiones,
        precio,
        moneda,
        ciudad,
        propietario,
        telefono_propietario,
        imagenesAEliminar,
      } = req.body;

      const ciudadId = parseInt(ciudad);
      if (isNaN(ciudadId)) {
        return res.status(400).json({ error: "ID de ciudad inválido" });
      }

      // Obtener la propiedad actual
      const [propiedad] = await pool.query(
        "SELECT url_imagen_principal FROM propiedades WHERE id = ?",
        [propiedadId]
      );

      if (!propiedad.length) {
        return res.status(404).json({ error: "Propiedad no encontrada" });
      }

      // Manejo de imágenes a eliminar
      let imagenesEliminadas = [];
      if (imagenesAEliminar) {
        const idsAEliminar = JSON.parse(imagenesAEliminar);

        if (idsAEliminar.length > 0) {
          const [imagenes] = await pool.query(
            "SELECT id, url_imagen FROM imagenes_propiedad WHERE id IN (?)",
            [idsAEliminar]
          );

          for (const img of imagenes) {
            try {
              const filename = img.url_imagen.replace(/^uploads\//, "");
              const filePath = path.join(__dirname, "uploads", filename);
              await fs.unlink(filePath);
              imagenesEliminadas.push(img.id);
            } catch (err) {
              console.error(`Error eliminando ${img.url_imagen}:`, err);
            }
          }

          await pool.query("DELETE FROM imagenes_propiedad WHERE id IN (?)", [
            idsAEliminar,
          ]);
        }
      }

      // Agregar nuevas imágenes secundarias
      const nuevasImagenes = req.files["imagenesSecundarias"] || [];
      if (nuevasImagenes.length > 0) {
        const valoresImagenes = nuevasImagenes.map((img) => [
          propiedadId,
          img.filename,
        ]);

        await pool.query(
          "INSERT INTO imagenes_propiedad (propiedad_id, url_imagen) VALUES ?",
          [valoresImagenes]
        );
      }

      // Manejar imagen principal
      let urlImagenPrincipal = propiedad[0].url_imagen_principal;
      if (req.files["imagenPrincipal"]?.[0]) {
        // Caso 1: Hay una nueva imagen subida
        urlImagenPrincipal = req.files["imagenPrincipal"][0].filename; // <-- Quitar 'uploads/'
      } else if (req.body.url_imagen_principal) {
        // Caso 2: Se seleccionó una imagen existente
        urlImagenPrincipal = req.body.url_imagen_principal;
      }
      // Actualizar propiedad
      await pool.query(
        `UPDATE propiedades SET 
        titulo = ?, descripcion = ?, tipo = ?, estado = ?, ubicacion = ?,
        habitaciones = ?, banios = ?, pisos = ?, garage = ?, dimensiones = ?,
        precio = ?, moneda = ?, ciudad = ?, propietario = ?,
        telefono_propietario = ?, url_imagen_principal = ?
      WHERE id = ?`,
        [
          titulo,
          descripcion,
          tipo,
          estado,
          ubicacion,
          habitaciones,
          banios,
          pisos,
          garage,
          dimensiones,
          precio,
          moneda,
          ciudadId,
          propietario,
          telefono_propietario,
          urlImagenPrincipal,
          propiedadId,
        ]
      );

      res.json({
        success: true,
        message: "Propiedad actualizada correctamente",
        imagenesEliminadas: imagenesEliminadas.length,
        nuevasImagenes: nuevasImagenes.length,
      });
    } catch (err) {
      console.error("Error al actualizar propiedad:", err);
      res.status(500).json({ error: "Error al actualizar propiedad" });
    }
  }
);

app.delete(
  "/api/propiedades/:id",
  authenticateToken,
  adminOnly,
  async (req, res) => {
    try {
      const propiedadId = req.params.id;

      // Eliminar imágenes asociadas
      const [imagenes] = await pool.query(
        "SELECT url_imagen FROM imagenes_propiedad WHERE propiedad_id = ?",
        [propiedadId]
      );

      for (const img of imagenes) {
        try {
          const filename = img.url_imagen.replace(/^uploads\//, "");
          const filePath = path.join(__dirname, "uploads", filename);
          await fs.unlink(filePath);
        } catch (err) {
          console.error(`No se pudo eliminar ${img.url_imagen}:`, err);
        }
      }

      // Eliminar registros de la base de datos
      await pool.query(
        "DELETE FROM imagenes_propiedad WHERE propiedad_id = ?",
        [propiedadId]
      );

      const [result] = await pool.query(
        "DELETE FROM propiedades WHERE id = ?",
        [propiedadId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Propiedad no encontrada" });
      }

      res.json({ message: "Propiedad eliminada correctamente" });
    } catch (err) {
      console.error("Error al eliminar propiedad:", err);
      res.status(500).json({ error: "Error al eliminar propiedad" });
    }
  }
);

/* 9. Endpoints adicionales */
app.get("/api/tipos", async (req, res) => {
  try {
    const [results] = await pool.query("SELECT id, nombre_tipo FROM tipos");
    res.json(results);
  } catch (err) {
    console.error("Error al obtener tipos de propiedad:", err);
    res.status(500).json({ error: "Error al obtener tipos de propiedad" });
  }
});

app.get("/api/ciudades", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT id, nombre_ciudad FROM ciudades"
    );
    res.json(results);
  } catch (err) {
    console.error("Error al obtener ciudades:", err);
    res.status(500).json({ error: "Error al obtener ciudades" });
  }
});

/* 10. Middleware para manejo de errores */
app.use((err, req, res, next) => {
  console.error("Error global:", err.stack);
  res.status(500).json({ error: "Error interno del servidor" });
});

/* 12. GET API/inicio Destacadas */
app.get("/api/inicio", async (req, res) => {
  let connection;
  try {
    const { ciudad, tipo } = req.query;

    // Obtener conexión del pool
    connection = await pool.getConnection();

    // Construir consulta base
    // let sql = "SELECT * FROM propiedades WHERE destacada=1";

    let sql =
      "(SELECT p.*, t.nombre_tipo AS Ntipo, c.nombre_ciudad AS Nciudad FROM propiedades p JOIN TIPOS t ON p.tipo = t.id JOIN CIUDADES c ON p.ciudad = c.id WHERE p.destacada = 1 ORDER BY RAND() ) UNION ALL ( SELECT p.*, t.nombre_tipo AS Ntipo, c.nombre_ciudad AS Nciudad FROM propiedades p JOIN TIPOS t ON p.tipo = t.id JOIN CIUDADES c ON p.ciudad = c.id WHERE p.destacada = 0 ORDER BY RAND() ) LIMIT 4;";
    const params = [];

    console.log("QUERY INICIO :", sql);

    // Agregar filtros si existen
    if (ciudad) {
      sql += " AND ciudad = ?";
      params.push(ciudad);
    }

    if (tipo) {
      sql += " AND tipo = ?";
      params.push(tipo);
    }

    // Ejecutar consulta
    const [rows] = await connection.query(sql, params);
    console.log("QUERY -->", sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Error en /api/inicio:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener propiedades",
      error: error.message,
    });
  } finally {
    // Liberar conexión
    if (connection) connection.release();
  }
});

/* 13. Endpoint para el formulario de contacto */
app.post("/api/contacto", async (req, res) => {
  console.log("Solicitud recibida en /api/contacto"); // Log de depuración

  const { nombre, email, telefono, asunto, mensaje } = req.body;

  // Validación básica
  if (!nombre || !email || !mensaje) {
    console.log("Faltan campos requeridos");
    return res.status(400).json({
      success: false,
      message: "Faltan campos requeridos",
    });
  }

  try {
    // Configuración del transporte (ejemplo para Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email para el administrador
    await transporter.sendMail({
      from: `"Formulario de Contacto" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `Nuevo contacto: ${asunto}`,
      text: `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${
        telefono || "No proporcionado"
      }\nMensaje: ${mensaje}`,
    });

    console.log("Correo enviado exitosamente");
    res.json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor al procesar el mensaje",
    });
  }
});

/* 11. Iniciar servidor */
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});

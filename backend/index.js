const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3001;

// Permitir peticiones desde React (puerto 5173 de Vite)
app.use(cors());

// Para leer JSON en POST
app.use(express.json());

// Datos simulados (como si vinieran de una base de datos)
let usuarios = [
  { id: 1, nombre: "Ana Pérez", email: "ana@email.com" },
  { id: 2, nombre: "Carlos López", email: "carlos@email.com" },
  { id: 3, nombre: "María García", email: "maria@email.com" },
];

// Endpoint GET para obtener todos los usuarios
app.get("/api/usuarios", (req, res) => {
  res.json({ success: true, data: usuarios });
});

// Endpoint GET para obtener un usuario por ID
app.get("/api/usuarios/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find((u) => u.id === id);

  if (!usuario) {
    return res.status(404).json({
      success: false,
      error: "Usuario no encontrado",
    });
  }

  res.json({ success: true, data: usuario });
});

// Endpoint PUT para actualizar un usuario existente
app.put("/api/usuarios/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, email } = req.body;

  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) {
    return res
      .status(404)
      .json({ success: false, error: "Usuario no encontrado" });
  }
  if (!nombre || !email) {
    return res
      .status(400)
      .json({ success: false, error: "Nombre y email son requeridos" });
  }
  if (!email.includes("@") || !email.includes(".")) {
    return res.status(400).json({ success: false, error: "Email inválido" });
  }

  usuario.nombre = nombre;
  usuario.email = email;
  res.json({ success: true, data: usuario });
});

// Endpoint DELETE para eliminar un usuario
app.delete("/api/usuarios/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const totalAntes = usuarios.length;

  usuarios = usuarios.filter((u) => u.id !== id);

  if (usuarios.length === totalAntes) {
    return res
      .status(404)
      .json({ success: false, error: "Usuario no encontrado" });
  }

  res.json({ success: true, message: `Usuario con id ${id} eliminado` });
});

// Endpoint POST para crear nuevo usuario
app.post("/api/usuarios", (req, res) => {
  const { nombre, email } = req.body;
  // Validar que llegaron los datos
  if (!nombre || !email) {
    return res.status(400).json({
      success: false,
      error: "Nombre y email son requeridos",
    });
  }
  // Validar formato de email (básico)
  if (!email.includes("@") || !email.includes(".")) {
    return res.status(400).json({
      success: false,
      error: "Email inválido",
    });
  } // Crear nuevo usuario con ID automático
  const nuevoId =
    usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
  const nuevoUsuario = {
    id: nuevoId,
    nombre,
    email,
  };
  usuarios.push(nuevoUsuario);
  res.status(201).json({
    success: true,
    data: nuevoUsuario,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo  en http://localhost:${PORT}`);
  console.log("Endpoints disponibles");
  console.log("  GET /api/usuarios");
  console.log("  GET /api/usuarios/:id");
});

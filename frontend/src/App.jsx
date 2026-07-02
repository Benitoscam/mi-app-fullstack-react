import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:3001/api/usuarios";

function App() {
  // Estado de la lista
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estado del formulario
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [editandoId, setEditandoId] = useState(null); // null = modo "agregar"
  const [enviando, setEnviando] = useState(false);

  // Estado del feedback (toast)
  const [feedback, setFeedback] = useState(null); // { mensaje, tipo }

  // =============================================
  //  CARGA INICIAL Y RECARGA DE USUARIOS
  // =============================================
  function cargarUsuarios() {
    setCargando(true);
    setError(null);

    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error("Error en la petición");
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setUsuarios(data.data);
        } else {
          throw new Error(data.error || "Error al cargar usuarios");
        }
      })
      .catch((err) => {
        console.error("❌ Error:", err);
        setError(err.message);
      })
      .finally(() => setCargando(false));
  }

  // useEffect con array vacío = se ejecuta UNA SOLA VEZ cuando el componente se monta
  useEffect(() => {
    console.log("🔄 Pidiendo datos al backend...");
    cargarUsuarios();
  }, []);

  // Feedback visual: se auto-oculta después de 3 segundos
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // =============================================
  //  MODO EDICIÓN
  // =============================================
  async function iniciarEdicion(id) {
    // Uso GET /api/usuarios/:id para traer los datos frescos de ese usuario
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Usuario no encontrado");

      setEditandoId(data.data.id);
      setNombre(data.data.nombre);
      setEmail(data.data.email);
    } catch (err) {
      console.error("❌ Error:", err);
      setFeedback({ mensaje: `❌ ${err.message}`, tipo: "danger" });
    }
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setNombre("");
    setEmail("");
  }

  // =============================================
  //  CREAR / ACTUALIZAR (mismo formulario)
  // =============================================
  async function manejarSubmit(e) {
    e.preventDefault();

    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim();

    if (!nombreLimpio || !emailLimpio) {
      setFeedback({ mensaje: "⚠️ Completa todos los campos", tipo: "warning" });
      return;
    }
    if (!emailLimpio.includes("@") || !emailLimpio.includes(".")) {
      setFeedback({ mensaje: "⚠️ Email inválido", tipo: "warning" });
      return;
    }

    setEnviando(true);
    const esEdicion = editandoId !== null;
    const url = esEdicion ? `${API_URL}/${editandoId}` : API_URL;
    const method = esEdicion ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreLimpio, email: emailLimpio }),
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Error al guardar");

      setFeedback({
        mensaje: esEdicion
          ? "✅ Usuario actualizado correctamente"
          : "✅ Usuario agregado correctamente",
        tipo: "success",
      });
      cancelarEdicion();
      cargarUsuarios();
    } catch (err) {
      console.error("❌ Error:", err);
      setFeedback({ mensaje: `❌ ${err.message}`, tipo: "danger" });
    } finally {
      setEnviando(false);
    }
  }

  // =============================================
  //  ELIMINAR
  // =============================================
  async function eliminarUsuario(id) {
    console.log("1️⃣ eliminarUsuario llamado con id:", id);
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar al usuario #${id}?`,
    );
    console.log("2️⃣ Confirmado:", confirmado);
    if (!confirmado) return;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      console.log("3️⃣ Respuesta del servidor, status:", res.status);
      const data = await res.json();
      console.log("4️⃣ Data recibida:", data);

      if (!data.success) throw new Error(data.error || "Error al eliminar");

      if (editandoId === id) cancelarEdicion();

      console.log("5️⃣ Llamando a setFeedback y cargarUsuarios...");
      setFeedback({
        mensaje: "🗑️ Usuario eliminado correctamente",
        tipo: "success",
      });
      cargarUsuarios();
      console.log("6️⃣ Terminado sin errores");
    } catch (err) {
      console.error("❌ Error:", err);
      setFeedback({ mensaje: `❌ ${err.message}`, tipo: "danger" });
    }
  }

  // =============================================
  //  RENDER
  // =============================================
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="display-4 fw-bold text-primary">
              📋 Lista de Usuarios
            </h1>
            <p className="text-muted">
              <span className="badge bg-primary fs-6">
                {usuarios.length} usuarios
              </span>{" "}
              en total
            </p>
          </div>

          {/* Feedback (toast simple) */}
          {feedback && (
            <div
              className={`alert alert-${feedback.tipo} text-center`}
              role="alert"
            >
              {feedback.mensaje}
            </div>
          )}

          {/* FORMULARIO: Agregar / Editar */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                {editandoId
                  ? `✏️ Editando usuario #${editandoId}`
                  : "➕ Agregar nuevo usuario"}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={manejarSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Juan Pérez"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="ejemplo@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-success w-100"
                      disabled={enviando}
                    >
                      {enviando
                        ? "Guardando..."
                        : editandoId
                          ? "✔️ Guardar cambios"
                          : "➕ Agregar usuario"}
                    </button>
                    {editandoId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary w-100 mt-2"
                        onClick={cancelarEdicion}
                      >
                        Cancelar edición
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Estado: Cargando */}
          {cargando && (
            <div className="text-center mt-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 text-muted">Cargando usuarios...</p>
            </div>
          )}

          {/* Estado: Error */}
          {!cargando && error && (
            <div className="alert alert-danger" role="alert">
              <strong>❌ Error:</strong> {error}
            </div>
          )}

          {/* Estado: Sin datos */}
          {!cargando && !error && usuarios.length === 0 && (
            <div className="alert alert-info text-center" role="alert">
              <h4>📭 No hay usuarios disponibles</h4>
            </div>
          )}

          {/* Estado: Datos cargados */}
          {!cargando && !error && usuarios.length > 0 && (
            <div className="row g-3">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="col-12 card-transition">
                  <div className="card shadow-sm hover-card">
                    <div className="card-body d-flex align-items-center gap-3">
                      <div className="avatar-circle bg-primary text-white flex-shrink-0">
                        {usuario.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-grow-1 text-start">
                        <h5 className="card-title mb-1">{usuario.nombre}</h5>
                        <p className="card-text text-muted mb-0">
                          <i className="bi bi-envelope me-1"></i>
                          {usuario.email}
                        </p>
                      </div>
                      <span className="badge bg-light text-secondary rounded-pill flex-shrink-0">
                        #{usuario.id}
                      </span>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="Editar"
                          onClick={() => iniciarEdicion(usuario.id)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Eliminar"
                          onClick={() => eliminarUsuario(usuario.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

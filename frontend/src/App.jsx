import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // useEffect con array vacío = se ejecuta UNA SOLA VEZ cuando el componente se monta
  useEffect(() => {
    console.log('🔄 Pidiendo datos al backend...')
    
    fetch('http://localhost:3001/api/usuarios')
      .then(res => {
        if (!res.ok) {
          throw new Error('Error en la petición')
        }
        return res.json()
      })
      .then(data => {
        console.log('📦 Datos recibidos:', data)
        setUsuarios(data.data)
        setCargando(false)
      })
      .catch(err => {
        console.error('❌ Error:', err)
        setError(err.message)
        setCargando(false)
      })
  }, [])

  // Estado: Cargando
  if (cargando) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando usuarios...</p>
      </div>
    )
  }

  // Estado: Error
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <strong>❌ Error:</strong> {error}
        </div>
      </div>
    )
  }

  // Estado: Sin datos
  if (usuarios.length === 0) {
    return (
      <div className="container mt-5">
        <div className="alert alert-info text-center" role="alert">
          <h4>📭 No hay usuarios disponibles</h4>
        </div>
      </div>
    )
  }

  // Estado: Datos cargados
  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="display-4 fw-bold text-primary">📋 Lista de Usuarios</h1>
            <p className="text-muted">
              <span className="badge bg-primary fs-6">{usuarios.length} usuarios</span> en total
            </p>
          </div>

          {/* ✅ LISTA DE USUARIOS - CORREGIDA */}
          <div className="row g-3">
            {usuarios.map((usuario) => {
              return (
                <div key={usuario.id} className="col-12 card-transition">
                  <div className="card shadow-sm hover-card">
                    <div className="card-body d-flex align-items-center gap-3">
                      {/* Avatar con inicial */}
                      <div className="avatar-circle bg-primary text-white flex-shrink-0">
                        {usuario.nombre.charAt(0).toUpperCase()}
                      </div>
                      {/* Contenido alineado a la izquierda */}
                      <div className="flex-grow-1 text-start">
                        <h5 className="card-title mb-1">{usuario.nombre}</h5>
                        <p className="card-text text-muted mb-0">
                          <i className="bi bi-envelope me-1"></i>
                          {usuario.email}
                        </p>
                      </div>
                      {/* Badge ID */}
                      <span className="badge bg-light text-secondary rounded-pill flex-shrink-0">
                        #{usuario.id}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
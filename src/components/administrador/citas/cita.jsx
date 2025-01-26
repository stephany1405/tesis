
import Calendario from "./calendario"

export default function AdminAppointmentsPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", marginBottom: "1.5rem" }}>Gestión de Citas</h1>
      <Calendario />
    </div>
  )
}


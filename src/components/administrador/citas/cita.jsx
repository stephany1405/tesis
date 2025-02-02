
import Calendario from "./calendario"
import { Calendar} from "lucide-react"

export default function AdminAppointmentsPage() {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1.5rem", textAlign: "center"}}> <Calendar size={35} />Citas</h1>
      <Calendario />
    </div>
  )
}


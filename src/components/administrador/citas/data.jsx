import { addDays, setHours, setMinutes } from "date-fns"

const services = [
  { name: "Manicura Básica", duration: 60, color: "#FF69B4" },
  { name: "Pedicura Spa", duration: 90, color: "#20B2AA" },
  { name: "Uñas Acrílicas", duration: 120, color: "#BA55D3" },
  { name: "Esmaltado Semipermanente", duration: 45, color: "#FF6347" },
]

const clients = [
  "María González",
  "Juan Pérez",
  "Ana Rodríguez",
  "Carlos Sánchez",
  "Laura Martínez",
  "Pedro Fernández",
  "Sofía López",
  "Diego Torres",
]

const specialists = ["Elena Gómez", "Javier Ruiz", "Carmen Vega", "Roberto Mendoza"]

const statuses = ["confirmed", "pending", "cancelled"]

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateMockAppointments(numDays = 7) {
  const appointments = []
  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)

  for (let i = 0; i < numDays; i++) {
    const currentDate = addDays(startDate, i)
    const numAppointments = Math.floor(Math.random() * 5) + 3 // 3-7 appointments per day

    for (let j = 0; j < numAppointments; j++) {
      const service = randomChoice(services)
      const startTime = setHours(setMinutes(currentDate, 0), 9 + Math.floor(Math.random() * 8))
      const endTime = new Date(startTime.getTime() + service.duration * 60000)

      appointments.push({
        id: `appointment-${i}-${j}`,
        title: service.name,
        start: startTime.toISOString(),
        end: endTime.toISOString(),
        client: randomChoice(clients),
        specialist: randomChoice(specialists),
        status: randomChoice(statuses),
        service: service.name,
        color: service.color,
      })
    }
  }

  return appointments
}


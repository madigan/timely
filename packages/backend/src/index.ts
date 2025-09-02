import { PORT } from "./env"
import server from "./server"

server.listen(PORT, () => {
  console.log(`🚀 Timely server is running on http://localhost:${PORT}`)
})

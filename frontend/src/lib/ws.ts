let socket: WebSocket | null = null

export function connectWS() {
  socket = new WebSocket("ws://localhost:8787")

  socket.onopen = () => {
    console.log("WS Connected")
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)

    console.log("WS Message:", data)
  }

  socket.onclose = () => {
    console.log("WS Closed")
  }

  return socket
}

export function getSocket() {
  return socket
}

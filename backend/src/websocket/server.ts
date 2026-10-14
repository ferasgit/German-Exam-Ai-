import { WebSocketServer } from "ws"

import { EVENTS } from "./events"
import { ExamEngine } from "../exam/stateMachine"

const exam = new ExamEngine()

export function createWSServer(server: any) {
  const wss = new WebSocketServer({ server })

  wss.on("connection", (ws) => {
    console.log("Client Connected")

    ws.send(
      JSON.stringify({
        type: "CONNECTED",
        state: exam.state,
      })
    )

    ws.on("message", (message) => {
      const data = JSON.parse(message.toString())

      console.log("Message:", data)

      switch (data.type) {
        case EVENTS.START_EXAM:
          exam.state = "INTRODUCTION"

          ws.send(
            JSON.stringify({
              type: EVENTS.AI_RESPONSE,
              text: "Welcome to the German speaking exam.",
              state: exam.state,
            })
          )

          break

        case EVENTS.NEXT_ROUND:
          const next = exam.next()

          ws.send(
            JSON.stringify({
              type: EVENTS.NEXT_ROUND,
              state: next,
            })
          )

          break
      }
    })

    ws.on("close", () => {
      console.log("Client disconnected")
    })
  })
}

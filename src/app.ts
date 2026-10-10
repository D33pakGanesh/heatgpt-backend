import express, { Request, Response, NextFunction } from "express"
import cors from "cors"
import compression from "compression"
import dotenv from "dotenv"

import lgaRouter from "./routes/lga"
import chatRouter from "./routes/chat"

dotenv.config()

const app = express()

// ── Request logger ────────────────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  const { method, url } = req

  // Log on response finish so we capture status + duration
  res.on('finish', () => {
    const ms = Date.now() - start
    const status = res.statusCode
    const color = status >= 500 ? '✗' : status >= 400 ? '!' : status >= 300 ? '→' : '✓'
    console.log(`${color} ${method} ${url} ${status} — ${ms}ms`)
  })

  next()
})

app.use(compression())
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }))
app.use(express.json())

app.use("/api", lgaRouter)
app.use("/api", chatRouter)

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" })
})

export default app

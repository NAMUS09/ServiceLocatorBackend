import cors from "cors";
import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import http from "http";
import morgan from "morgan";

import servicesRouter from "./routes/serviceRoutes";

dotenv.config();

// Initialize Express and HTTP server
const app: Express = express();
const server = http.createServer(app);

app.use(express.json());

app.use(morgan("dev"));

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://emergency-service-locator.vercel.app",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    resultMessage: "Project is successfully working...",
  });
});

app.use("/api/services", servicesRouter);

server.listen(process.env.PORT, async (err?: Error) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log(
    `[server]: Server is running at http://localhost:${process.env.PORT}`
  );
});

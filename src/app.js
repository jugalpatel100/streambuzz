import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    // origin: [`http://localhost:${process.env.PORT}`],
    credentials: true,
  })
);
app.use(
  express.json({
    limit: "16kb",
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
app.use(express.static("public"));
app.use(cookieParser());

//import router obj from route
import userRouter from "./routes/user.route.js";

//define route
app.use("/api/v1/user", userRouter);
//http://localhost:3000/api/v1/users/<route_name>

export { app };

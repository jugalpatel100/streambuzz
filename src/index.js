// require("dotenv").config({ path: "/.env" });

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "app.js";

dotenv.config({ path: ".env" }); //starts from the root directory

connectDB()
  .then(() => {
    app.listen(process.env.port || 8000, () => {
      console.log(`Server is running at ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(`MongoDB connection ERROR`);
  });

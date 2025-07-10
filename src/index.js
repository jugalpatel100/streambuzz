// require("dotenv").config({ path: "/.env" });

import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({ path: ".env" }); //starts from the root directory

connectDB();

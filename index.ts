import express, { Application } from "express"
import dotenv from "dotenv"
import cors from "cors"
import { MainApp } from "./mainApp"
import { dbConfig } from "./utils/dbConfig"
import router from "./router/userRouter"

dotenv.config()
const app:Application = express()

app.use(express.json())
app.use(cors())


// MainApp(app)
app.listen(process.env.PORT,() =>{
    console.log("connected...");
    dbConfig()
})


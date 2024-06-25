import express from 'express'
import cors from 'cors'
import dotenv from "dotenv"
import connectDB from './db/connectDB.js'
import router from './routes/index.js' 
import cookiesParser from 'cookie-parser' 
import { app, server } from './socket/index.js' 
dotenv.config()

// const app = express()
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true
}))
app.use(express.json())
app.use(express.urlencoded())
app.use(cookiesParser())

const PORT = process.env.PORT || 8080

app.get('/',(req,response)=>{
    response.json({
        message : "Server running at " + PORT
    })
})

//api endpoints
app.use('/api',router)

connectDB()
.then(()=>{
    server.listen(PORT,()=>{
        console.log("server running at " + PORT)
    })
})

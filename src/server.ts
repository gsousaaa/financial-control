import cors from 'cors'
import express from 'express'
import dotenv from 'dotenv'
import authRoutes from '../src/routes/authRoutes'
import userRoutes from '../src/routes/userRoutes'


dotenv.config()

const app = express()

app.use(cors())

app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/api', userRoutes)

app.listen(process.env.PORT, ()=> {
        console.log(`Server rodando porta ${process.env.PORT}`)
})



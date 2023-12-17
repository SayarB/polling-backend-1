const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
const userRoutes = require('./routes/userRoutes')
const pollRoutes = require('./routes/pollRoutes')
const examRoutes = require('./routes/examRoutes')



app.use(cors({credentials:true, origin:['http://localhost:3000','https://polling-sayarb.netlify.app','https://pollifyhub.netlify.app']}))
app.use(express.json())
app.use(cookieParser())

const password = 'J74XncmHaoMFgzpi'
const mongo_url = 'mongodb+srv://yashoo24tk:J74XncmHaoMFgzpi@mycluster.gue60cc.mongodb.net/?retryWrites=true&w=majority'


const mongoose = require('mongoose')

mongoose.connect(mongo_url)

app.use('/users',userRoutes)
app.use('/polls',pollRoutes)
app.use('/exams', examRoutes)


app.listen(8000)
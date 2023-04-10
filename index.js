const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express()
app.use(cors({credentials:true, origin:['https://89a1-136-233-9-123.ngrok-free.app']}))
app.use(express.json())
app.use(cookieParser())

const password = 'J74XncmHaoMFgzpi'
const mongo_url = 'mongodb+srv://yashoo24tk:J74XncmHaoMFgzpi@mycluster.gue60cc.mongodb.net/?retryWrites=true&w=majority'


const mongoose = require('mongoose')

mongoose.connect(mongo_url)

/* Schema(structure) of the poll */
const pollSchema = new mongoose.Schema({
    authorid: String,
    question: String,
    options: [
        { text: String, numOfRes: Number }
    ],
    totalResponses:{type: Number, default:0}
})

/* Schema(structure) of the user */
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true },
    password: { type: String, required: true }
})

/* Creating a user using mongoose model */
const User = mongoose.model('User', userSchema)

/* get request to get all the users */
app.get('/users', async function (req, res) {
    const users = await User.find()
    res.json(users)
})

/* Creating a poll using mongoose model */
const Poll = mongoose.model('Poll', pollSchema)


/* get request gets polls of a certain author*/
app.get('/poll', async function (req, res) {
    const id = req.query.authorid
    const poll = await Poll.find({ authorid: id })
    res.json(poll)
})

/* post request to create user */
app.post('/user', async function (req, res) {
    console.log(req.body)
    const obj = { name: req.body.name, email: req.body.email, password: req.body.password }
    try{
        const user = new User(obj)
        await user.save()
        console.log(user)
        res.cookie('user', user._id.toString())
        res.status(200).json(user)
    }catch(e){
        console.log(e)
        res.sendStatus(500)
    }
})
app.get('/user/verify', async function(req,res){
    
    const {user:id} = req.cookies
    console.log(id)
    if(!id){
        res.json({verified:false})
    }else{
        const user =  await User.findById(id)
        res.json({verified:true})
    }
})

/* post request for login */
app.post('/login', async function (req, res) {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne({ email: email }).exec();
    console.log(user)
    if (user) {
        if (user.password === password) {
            res.cookie('user', user._id)
            res.status(200).json({ success: true })
        }

        else {
            res.json({ error: 'Invalid password' })
        }
    }

    else {
        res.json({ error: 'Invalid email' })
    }
})

/* get request to get all the polls */
app.get('/', async (req, res) => {
    const polls = await Poll.find()
    res.json(polls)
})

/* get request to get a poll using id */
app.get('/:id', async function (req, res) {

    const { id } = req.params
    console.log(id)
    const poll = await Poll.findById(id)
    res.json(poll)
})

/* post request to create a poll */
app.post('/', async function (req, res) {
    const userid = req.cookies.user
    const user = await User.findById(userid)
    if (user) {
        const ques = req.body.title
        const obj = { authorid: userid, question: ques, options: req.body.options.map((opt)=>({text:opt, numOfRes:0})) }
        const poll = new Poll(obj)
        await poll.save()
        res.status(200).json(poll)
    }
    else {
        res.send(404).json({ message: 'User not found' })
    }

})

app.post('/answer/:id', async function(req, res) {
    const answer = req.body.option;
    const id = req.params.id;
    try{
    const poll = await Poll.findById(id);
    for (let option of poll.options)
    {
        if(option.text == answer)
        {
            option.numOfRes++;
            poll.totalResponses++;
        }
    }
    await poll.save();
    res.json({success:true,poll})
    }catch(e)
    {return res.status(404).json({error:"not found"})}
    
})

app.listen(8000)
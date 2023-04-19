const {Router} = require('express')
const router  = Router()
const {User,Poll, Quiz, QuizResponse} = require('../models/models')


const getUserByEmail = async(email)=>{
    const user = await User.findOne({email:email})
    return user
}

router.get('/', async function (req, res) {
    const users = await User.find()
    res.json(users)
})

router.post('/', async function (req, res) {
    console.log(req.body)
    const obj = { name: req.body.name, email: req.body.email, password: req.body.password }
    const emailExists = await getUserByEmail(obj.email)
    if(emailExists){
        return res.json({error:'email already exists'})
    }
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
router.get('/verify', async function(req,res){
    
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
router.post('/login', async function (req, res) {
    const email = req.body.email
    const password = req.body.password
    const user = await getUserByEmail(email)
    console.log(user)
    if (user) {
        if (user.password === password) {
            res.cookie('user', user._id)
            res.status(200).json({ success: true })
        }

        else {
            res.status(400).json({ error: 'Invalid password' })
        }
    }

    else {
        res.status(400).json({ error: 'Invalid email' })
    }
})

router.get('/details',async (req,res)=>{
    const {user:id} = req.cookies
    if(!id) return res.status(403).json({error:'unauthenticated'})
    const user  = await User.findById(id)
    const pollsCreated = await Poll.find({authorid:id}).select(['_id', 'question'])
    const examsCreated = await Quiz.find({authorid:id}).select(['_id','name'])
    const examsResponded = await QuizResponse.find({userId:id}).populate('quizId',{_id:1, name:1}).select(['_id','quizId','marks'])

    res.json({user, pollsCreated:pollsCreated._id, examsCreated,examsResponded})


})

router.post('/logout',async(req,res)=>{
    const {user} = req.cookies
    if(!user) return res.status(403).json({error:'unauthenticated'})

    res.clearCookie('user')
    res.json({success:true})
})

module.exports = router
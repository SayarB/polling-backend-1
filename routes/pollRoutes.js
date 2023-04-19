const {Router} = require('express')
const router  = Router()
const {Poll, User} = require('../models/models')


router.get('/', async (req, res) => {
    const polls = await Poll.find()
    res.json(polls)
})

/* get request to get a poll using id */
router.get('/:id', async function (req, res) {

    const { id } = req.params
    console.log(id)
    const poll = await Poll.findById(id)
    res.json(poll)
})

/* post request to create a poll */
router.post('/', async function (req, res) {
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
        res.status(404).json({ message: 'User not found' })
    }

})

router.post('/answer/:id', async function(req, res) {
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



module.exports = router
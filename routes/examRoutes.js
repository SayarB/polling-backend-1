const {Router} = require('express')
const router  = Router()
const {Quiz,QuizResponse} = require('../models/models')
const mongoose = require('mongoose')



router.get('/', async(req,res)=>{
    const exam  = await Quiz.find()
    res.json(exam)
})

router.get('/:id',async (req,res)=>{
    const {id} = req.params
    const {user} = req.cookies

    if(!user) return res.status(403).json({error:'unauthenticated'})



    const exam = await Quiz.findById(id)
    
    if(!exam) return res.status(404).json({error:'not found'})
    const responseIfAny = await QuizResponse.find({quizId:exam._id, userId:user})
    const questions = exam.questions.map(ques=>{
        return {text:ques.text, multiCorrect:ques.multiCorrect, options:ques.options.map(opt=>opt.text)}
    })
    const examData = {_id:exam._id, marksTotal:exam.marksTotal,questions, responded:responseIfAny.length>0} 
    if(!exam)
        return res.json({error:"exam id not valid"})
    res.json(examData)
})

router.post('/respond/:id', async(req,res)=>{
    const userId = req.cookies['user']
    if(!userId) return res.status(403).json({error:'unauthenticated'})
    const body = req.body
    console.log(req.body)
    const {id} = req.params 
    const exam = await Quiz.findById(id);
    if(!exam) return res.json({error:'exam could not be found'})
    var marks = 0
    var marksTotal = exam.marksTotal
    const marksPerQuestion = marksTotal/exam.questions.length
    
    body.responses.forEach((ques,i)=>{
        if(ques.length>0)
        {    
            var correctIndices = []
            exam.questions[i].options.forEach((option,i)=>{
                if(option.isCorrect) correctIndices.push(i)
            })
            console.log('correctIndices : ',correctIndices)
            var numberOfCorrectAnswersMarked = 0
            var numberOfWrongAnswersMarked = 0;
            ques.forEach(ques_opt=>{
                if(correctIndices.includes(ques_opt))
                    numberOfCorrectAnswersMarked++
                else numberOfWrongAnswersMarked++
            })

            console.log('correct: ',numberOfCorrectAnswersMarked,'wrong: ', numberOfWrongAnswersMarked)
            if(numberOfWrongAnswersMarked===0) marks+=(numberOfCorrectAnswersMarked/correctIndices.length) * marksPerQuestion
        }
    })
    console.log(marks)
    const quizResponse = new QuizResponse({
        quizId:new mongoose.Types.ObjectId(id),
        userId:new mongoose.Types.ObjectId(userId),
        optionsSelected: body.responses,
        marks
    })
    await quizResponse.save()
    res.status(200).json({success:true, marks})
})


router.post('/', async(req,res)=>{
    const {user} = req.cookies
    if(!user) return res.status(403).json({error:"unauthenticated"})
    const body =  req.body

    console.log(body)
    const exam = new Quiz({...body,authorid:user})
    await exam.save()
    res.json(exam)
})

router.delete('/',async(req,res)=>{
    await QuizResponse.deleteMany()
    await Quiz.deleteMany()
    res.json({success:true})
})

router.delete('/responses', async(req,res)=>{
    await QuizResponse.deleteMany()
    res.json({success:true})
})

router.get('/responses/:id',async(req,res)=>{
    const responses = await QuizResponse.find({quizId:req.params.id}).populate(['quizId','userId', 'marks'])
    res.json(responses)
})

module.exports = router
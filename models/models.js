const mongoose = require('mongoose')
const pollSchema = new mongoose.Schema({
    authorid: {type:mongoose.Schema.Types.ObjectId},
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

const quizSchema = new mongoose.Schema({
    authorid: {type:mongoose.Schema.Types.ObjectId, ref:'User'},
    name:String,
    questions: {type:[{
        text:String,
        multiCorrect:Boolean,
        options:[
            {
                text:String,
                isCorrect: Boolean
            }
        ]
    }], required:true},
    marksTotal:Number
})

const quizResponseSchema = new mongoose.Schema({
    quizId: {type:mongoose.Schema.Types.ObjectId, ref:'Quiz'},
    userId:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
    optionsSelected:[[Number]],
    marks:Number
})

/* Creating a user using mongoose model */
const User = mongoose.model('User', userSchema)
/* Creating a poll using mongoose model */
const Poll = mongoose.model('Poll', pollSchema)

const Quiz = mongoose.model('Quiz', quizSchema)

const QuizResponse = mongoose.model('QuizResponse', quizResponseSchema)

module.exports = {User,Poll,Quiz,QuizResponse}

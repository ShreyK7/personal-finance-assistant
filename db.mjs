import './config.mjs'
import mongoose from 'mongoose';

mongoose.connect(process.env.DSN)

const { Schema } = mongoose;

const userSchema = new Schema({
    username: String,
    password: String, 
    email: String,
    spending_lists: Array
})

const transactionSchema = new Schema({
    name: String,
    price: Number,
    date: String
})

const spendingList = new Schema({
    user: String,
    name: String, 
    month: String,
    transactions: [transactionSchema],
    logDateTime: Date
})


mongoose.model('User', userSchema)
mongoose.model('SpendingList', spendingList)
mongoose.model('Transaction', transactionSchema)

import './config.mjs'
import express from 'express'
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import './db.mjs';
import { startSession, endSession, register, login } from './authentication.mjs'
import { addNewList } from './listHelperFunctions.mjs'

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(express.urlencoded({extended: true}));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
}));


app.use((req, res, next) => {
    if(!req.session.user && req.path != '/login' && req.path != '/register') {
        res.redirect('/login');
    }
    else {
        next();
    }
});


app.use((req, res, next) => {
    console.log(req.path.toUpperCase(), req.body);
    next();
});


const lists = mongoose.model('SpendingList')
const User = mongoose.model('User');
const transactions = mongoose.model('Transaction')


app.get('/login', async function(req, res) {
    res.render('login.hbs');
})


app.post('/login', async function(req, res) {
    try {
        const user = await login(req.body.username, req.body.password);
        await startSession(req, user);
        res.redirect('/');
    }
    catch(err) {
        console.log(err);
        res.render('login.hbs', {error: err.message});
    }
})


app.get('/register', async function(req, res) {
    res.render('register.hbs');
})

app.post('/register', async function(req, res) {
    try {
        const user = await register(req.body.username, req.body.email, req.body.password);
        await startSession(req, user);
        res.redirect('/');
    }
    catch(err) {
        console.log(err);
        res.render('register.hbs', {error: err.message});
    }
})


app.get('/', (req, res) => {
    res.redirect('/lists')
})


app.get('/addList', async function(req, res) {
    res.render('addList.hbs');
});

app.post('/addList', async function(req, res) {
    try {
        console.log(req.body)
        await addNewList(req.session.user, req.body.name, req.body.month);
        res.redirect('/lists');
    }
    catch(err) {
        console.log(err);
        res.render('addList.hbs', {error: err.message});
    }
});



app.get('/lists', async function(req, res) {
    try {
        const spending_lists = await lists.find({ user: req.session.user.username });
        console.log(spending_lists);
        res.render('lists.hbs', { user:req.session.user, lists:spending_lists });
    } 
    catch (err) {
        console.log(err)
        res.status(500).send('Error occured when trying to fetch lists');
    }
});


app.get('/lists/:list', async function(req, res) {
    try {
        console.log('current list: ' + req.params.list)

        const list = await lists.findOne({ user:req.session.user.username, name:req.params.list })
        res.render('listEditor.hbs', { List: list.name, transactions: list.transactions })
    }
    catch(err) {
        console.log(err)
        res.status(500).send("Oops! Looks like that page doesn't exist");
    }
});

app.post('/lists/:list', async function(req, res) {
    const list = await lists.findOne({ user:req.session.user.username, name:req.params.list })
    list.transactions.push({name: req.body.item, price: req.body.price, date: req.body.date})

    await list.save();

    const addedMsg = 'Added ' + req.body.item + ' for $' + req.body.price

    res.render('listEditor.hbs', {addedItem: addedMsg, List: list.name, transactions: list.transactions})
});

app.get('/lists/:list/remove', async function(req, res) {
    try {
        await lists.findOne({user:req.session.user.username, name:req.params.list});
        res.render('listRemove.hbs', {List: req.params.list});
    }
    catch(err) {
        console.log(err);
        res.status(500).send("Oops! Looks like that spending list doesn't exist");
    }
});

app.post('/lists/:list/remove', async function(req, res) {
    try {
        const list = await lists.findOne({user:req.session.user.username, name:req.params.list});
        const item = req.body.item;
        const price = req.body.price;
        function findTransaction(transaction) {
            return transaction['name'] === item && transaction['price'] == price;
        }
        const transaction = list.transactions.filter(findTransaction)
        console.log(transaction)
        console.log(transaction['_id'])
        if (transaction)
        {
            list.transactions.pull({_id: transaction['_id']});
            await list.save();
            sucessMsg = item + ' removed scuessfully!';
            res.render('listRemove.hbs', {List: req.params.list, Msg: sucessMsg});
        }
        else
        {
            res.render('listRemove.hbs', {List: req.params.list, Msg: "Oops, looks like that item doesn't exist in the list! Make sure both the spelling and price of the item are exactly right."});
        }
    }
    catch(err) {
        console.log(err);
        res.status(500).send("Oops! Looks like there was an error removing your item");
    }
    
});

app.listen(process.env.PORT || 3000);
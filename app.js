//Initialize all the dependencies and middlewares
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
const config = require('./config/database');
const passport = require('passport');

//connection with mongoose
mongoose.connect(config.database);
let db = mongoose.connection;

//Checking the connection
db.once('open', function(){
    console.log("Connected to MongoDb");
});
db.on('error', function(err){
    console.log(err);
})

//calling in express
const app = express();

//Using body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Bringing in the model of mongoose
let Article = require('./models/article.js');

//Setting the view files
app.set('views', path.join(__dirname , 'views'));
app.set('view engine' , 'pug');
app.use(express.static(path.join(__dirname, 'public')));

//Setting the session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

//Setting up the messages
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Setting up the validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next){
    res.locals.user = req.user || null;
    next();
})

app.get('/' , function(req,res){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        }
        else{
            res.render('index',{
            title : 'Articles',
            articles : articles
            });
        }
    })
    
});

let article = require('./routes/articles');
app.use('/article', article);

let users = require('./routes/users');
app.use('/users', users);

app.listen(3000 , function(){
    console.log("Server started at port 3000");
});
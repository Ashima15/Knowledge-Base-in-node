const express = require('express');
const router = express.Router();

let Article = require('../models/article.js');
let User = require('../models/user.js');

router.get('/add' , ensureAuntheticated, function(req,res){
    res.render('add' , {
        title : 'Add Articles'
    })
});

router.post('/add' , function(req,res){
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();
    
    let errors = req.validationErrors();
    if(errors){
        res.render('add',{
            title: 'Add Articles',
            errors : errors
        })
    }
    else{
        let article = new Article();
        article.title = req.body.title;
        article.body = req.body.body;
        article.author = req.user._id;

        article.save(function(err){
            if(err){
                console.log(err);
                return;
            }
            else{
                req.flash('success' , 'Article added');
                res.redirect('/');
            }
        })
    }
});

router.get('/:id', function(req,res){
    Article.findById(req.params.id, function(err , article){
        User.findById(article.author, function(err, user){
          res.render('article' , {
            article : article,
            author : user.name
           })
        });
    });
});

router.get('/edit/:id', ensureAuntheticated, function(req,res){
    Article.findById(req.params.id, function(err , article){
        if(article.author != req.user._id){
            req.flash('danger', 'Not auntheticated');
            res.redirect('/');
        }
        res.render('edit' , {
        article : article
        })
    })
});

router.post('/edit/:id' , function(req,res){
    let article = {};
    article.title = req.body.title;
    article.body = req.body.body;
    article.author = req.body.author;
    
    let query = {_id : req.params.id}
    
    Article.update(query, article, function(err){
        if(err){
            console.log(err);
            return;
        }
        else{
            req.flash('primary', 'Article updated');
            res.redirect('/');
        }
    })
});

router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
    }
    
    let query = {_id : req.params.id};
    
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            res.status(500).send();
        }
        else{
            Article.remove(query, function(err){
                if(err){
                    console.log(err);
                }
                req.flash('danger' , "Article deleted");
                res.send("Success");
            })
        }
    })
    
    
});

function ensureAuntheticated(req, res, next){
    if(req.isAuthenticated()){
       return next();
    }
    else{
        req.flash('danger', 'You are not logged in!');
        res.redirect('/users/login');
    }
}

module.exports = router;
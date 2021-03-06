module.exports = function(passport){
  var bkfd2Password = require("pbkdf2-password");
  var hasher = bkfd2Password();
  var conn = require('../../config/mysql/db')();
  var route = require('express').Router();

  route.get('/login', (req,res)=>{
    var sql = 'SELECT id, title from topic';
    conn.query(sql, function(err, topics, fields){
      res.render('auth/login', {topics:topics});
    });
  })

  route.post('/login',
    passport.authenticate('local',
      { successRedirect: '/topic',
        failureRedirect: '/auth/login',
        failureFlash: false
      }
    )
  );

  route.post('/register', (req,res)=>{
    hasher({password: req.body.password}, function(err, pass, salt, hash){
      var user = {
        authID: 'local:'+req.body.username,
        username: req.body.username,
        password: hash,
        salt: salt,
        displayName: req.body.displayName
      };
      var sql = 'INSERT INTO users SET ?';
      conn.query(sql, user, function(err, results){
        if(err){
          console.log(err);
          res.status(500);
        }else{
          req.login(user, function(err){
            req.session.save(function(){
              res.redirect('/welcome');
            });
          });
        }
      });
    });
  });
  route.get('/register', (req,res)=>{
    var sql = 'SELECT id, title FROM topic';
    conn.query(sql, function(err, topics, fields){
      res.render('auth/register', {topics:topics});
    })
  });

  route.get('/logout', (req,res)=>{
    req.logout();
    req.session.save(function() {
      res.redirect('/topic');
    });
  });

  return route;
}

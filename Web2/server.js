const express = require('express');
const app = express();
app.use(express.static(__dirname + ''));

app.set('view engine', 'ejs');

require('dotenv').config();
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const cookieParser = require("cookie-parser");
app.use(cookieParser());
const { db } = require('./module/db');
const { auth } = require('./module/authMiddleware');
const User = require('./module/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const port = 8080;

db();

app.get('/logOut', function(req, res){
  return res.clearCookie('user').end();
});

app.get('/map', function(req, res){
  res.sendFile(__dirname + '/index.php');
});

app.get('/', auth, function(req, res) {
  const user = req.decoded;
  if(user){
    return res.render('loggedin', {user:user.docs});
  } else{
    return res.sendFile(__dirname + '/index.html');
  }
});

app.get('/login', auth, function(req, res) {
  const user = req.decoded;
  if(user){
    return res.render('loggedin', {user:user.docs});
  } else{
    return res.sendFile(__dirname + '/login.html');
  }
});

app.get('/Career', auth, function(req, res) {
  const user = req.decoded;
  if(user){
    return res.render('career', {user:user.docs});
  } else{
    return res.sendFile(__dirname + '/Career.html');
  }
});

app.get('/Board', auth, function(req, res) {
  const user = req.decoded;
  if(user){
    return res.render('board', {user:user.docs});
  } else{
    return res.sendFile(__dirname + '/Board.html');
  }
});

app.get('/Project', auth, function(req, res) {
  const user = req.decoded;
  if(user){
    return res.render('project', {user:user.docs});
  } else{
    return res.sendFile(__dirname + '/Project.html');
  }
});

app.get('/Skills', auth, function(req, res) {
  const user = req.decoded;
  if(user){
    return res.render('skills', {user:user.docs});
  } else{
    return res.sendFile(__dirname + '/Skills.html');
  }
});

app.get('/login/register', function(req, res){
  res.sendFile(__dirname + '/register.html');
});

app.post('/login/register/:signUpid/:signUpemail/:signUppw/:signUppwc', function(req, res, next) {
    let user = new User(req.body);
    if(user.pw!==user.pwc) {
        return res.send('비밀번호와 비밀번호 확인이 다릅니다.');
    }
    User.findOne({id:(user.id)}, function(err, docs) {
        if(err) throw err;
        else if(docs == null) { // Entered ID is available.
            if(user.id&&user.pw&&user.pwc) {    // adding a new account.
                return next();
            } else return res.send('빈칸없이 모두 입력해주세요.');
        }
        else {
            return res.send('입력하신 ID가 이미 존재합니다.');
        }
    });
});

app.post('/login/register/:signUpid/:signUpemail/:signUppw/:signUppwc', function(req, res) {
    let user = new User(req.body);
    bcrypt.genSalt(saltRounds, function (err, salt) {
        if (err) throw err;
        bcrypt.hash(user.pw, salt, function (err, hash) {
            if (err) throw err;
            user.pw = hash;
            user.save();
            return res.send('회원가입 성공!');
        })
    })
});

app.post('/login/:signInid/:signInpw', function(req, res, next) {
  console.log('req.body: ', req.body);
  let user = new User(req.body);
  User.findOne({id:(user.id)}, function(err, docs) {
      if(err) throw err;
      else if(docs == null) { // Entered ID does not exist.
          return console.log('Entered ID does not exist.');
      } else {  // when entered ID matches.
          bcrypt.compare(user.pw, docs.pw, function (err, answer) {
              if (err) throw err;
              if(answer) {
                  req.user = docs;
                  return next();
              } else {
                  return res.send('Your password does not match with your ID.');
              }
          })
      }
  });
});

app.post('/login/:signInid/:signInpw', function(req, res) {
  const docs = req.user;
  const payload = { // putting data into a payload
      docs,
  };
  // generating json web token and sending it
  jwt.sign(
  payload, // payload into jwt.sign method
  process.env.SECRET_KEY, // secret key value
  { expiresIn: "30m" }, // token expiration time
  (err, token) => {
      if (err) throw err;
      else {
          return res
          .cookie('user', token,{maxAge:30*60 * 1000}) // 1000 is a sec
          .end();
      }
  });
});

app.listen(port, () => console.log('listening on port ' + port));
const express = require('express');
const app = express();
const reload = require('reload');
const session = require('express-session');
const csrf = require('csurf');
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const Protection = csrf({
  cookie: true
});
const mongoose = require('mongoose');
const UserManager = require('./models/User');

mongoose.connect('url', {});
mongoose.set('strictQuery', true)
app.use(
  session({
    secret: "bangsawan",
    resave: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000
    },
    saveUninitialized: true
  })
);
app.use(cookieParser());
app.use((req, res, next) => {
  next()
})
app.set('views', 'views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());

let url = bodyParser.urlencoded({
  extended: false
});

app.get('/list', async function (req, res) {
  let listData = await UserManager.find({});
  
  return res.end(JSON.stringify(listData));
})

app.get('/:id', Protection, async function (req, res) {
  let isAuthor = false;
  let getData = req.cookies["_dname_id"];
  if (getData && getData == req.params.id) {
    isAuthor = true;
  }
  let userData = await UserManager.findOne({
    id: req.params.id
  });
  if (!userData) return res.status(404).send('ID ini tidak dapat ditemukan');

  res.render('room', {
    userData,
    isAuthor,
    csrfToken: req.csrfToken(),
    req
  });
});

app.get('/', Protection, function (req, res) {
  let isAlreadyCreate = req.cookies["_dname_id"];
  if (isAlreadyCreate) return res.redirect(`/${isAlreadyCreate}`);
  res.render('home', {
    csrfToken: req.csrfToken()
  })
});

app.post('/comment/:id', url, Protection, async function(req, res) {
  let getData = await UserManager.findOne({id:req.params.id});
  let data = {
    pesan: req.body.pesan,
    tanggal: Date.now(),
    reply: []
  }
  getData.komentar.push(data);
  getData.save();
  res.redirect(`/${req.params.id}`);
});

app.post('/new-link', url, Protection, function (req, res) {
  let {
    nama
  } = req.body;

  if (!nama) return res.send("Invalid name");

  let id = generateID(nama);

  let newBody = new UserManager({
    name: nama,
    komentar: [],
    id
  });
  newBody.save();
  res.cookie("_dname_id", id);
  res.redirect(`/${id}`);
});

app.listen(3000 || process.env.PORT, () => {
  console.log('Web server active');
});

function generateID(nama) {
  let namlength = nama.length;
  let date = new Date();
  return `${namlength}${date.getDate()}${date.getMilliseconds()}${date.getHours()}${date.getDay()}${date.getSeconds()}`;
}

const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const https = require('https');
const axios = require("axios");
const methodOverride = require('method-override');

// const fetch = require('node-fetch');

require('dotenv').config();

const app = express();

// initializing ejs, body-parser
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride('_method'));

// intializing session
app.use(session({
  secret: "Workout Routine App.",
  resave: false,
  saveUninitialized: false
}));

// initializing passport and passport-session
app.use(passport.initialize());
app.use(passport.session()); //using passport to manage our session

// mongoose connection with mongodb server
mongoose.set("strictQuery", false); //to avoid deprication warning
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// Routine schema

const routineSchema = new mongoose.Schema({
  workout: String,
  target_muscle: String,
  sets: String,
  reps: String
});

const Routine = mongoose.model("Routine", routineSchema);

// user schema for authentication

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  userRoutine: routineSchema
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

Description = 'Power and Strength';

app.get('/', function(req, res) {
  res.render('home', {Description: Description});
});

app.get('/login', function(req, res){
  res.render('login')
});

app.get('/signin', function(req, res){
  res.render('signin')
});

app.get('/logout', function(req, res){
  req.logout(function(err){
    if (err){
      console.log(err);
    }
  }) 
  res.redirect("/");
});

app.get('/profiles', function(req, res){
  if (req.isAuthenticated()) {
    Routine.find({})
    .then((dataFound) => {
      res.render('profiles', {ex_routine: dataFound});
      console.log(dataFound);
    })
    .catch((err) => {
      console.log(err);
    })
    // res.render('profiles');
  } else {
    res.redirect("/login");
  }
  
});

app.get('/update/:id', function(req, res){
  Routine.findOne({workout:req.params.id})
  .then((edit) => {
    res.render('update', {edit});
  })
  .catch((err) => {
    console.log(err);
  })
});

app.get('/exercise', function(req, res){
  res.render('exercise');
});

app.put('/update/:id', function(req, res){
  Routine.updateOne({workout:req.params.id}, {
    $set:{
       "sets" : req.body.updated_sets,
       "reps" : req.body.updated_reps
    }
  })
  .then((edit) => {
    res.redirect('/profiles');
  })
  .catch((err) => {
    console.log(err);
  })
});

app.delete('/profiles/:id', function(req, res){
  Routine.deleteOne({workout:req.params.id})
  .then((del) => {
    res.redirect('/profiles');
  })
  .catch((err) => {
    console.log(err);
  })
});

app.post('/profiles', function profile(req, res){
  const workoutName = req.body.workoutName;
  const targetMuscle = req.body.muscleName;
  
  var routine = new Routine({
    workout: workoutName,
    target_muscle: targetMuscle,
    sets: "0", 
    reps: "0"
  });
  routine.save();
  
  res.redirect("/profiles");
  // return routine;
});

app.post('/exercise', function(req, res){
  
  const options = {
    method: 'GET',
    url: 'https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises',
    params: {muscle: req.body.targetmuscle},
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY,
      'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com'
    }
  };
  
  axios.request(options).then(function (response) {
    // console.log(response.data);
    // res.json(response.data)
    let ex_data = response.data;
    res.render('exercise_data', {ex_data: ex_data})
  }).catch(function (error) {
    console.error(error);
  });
});

app.post('/signin', function(req, res){
  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect('/signin');
    } else {
      passport.authenticate('local')(req, res, function(){
        res.redirect('/profiles');
      });
    }
  });
});

app.post('/login', function(req, res){

  const user =  new User ({
    username: req.body.username,
    password: req.body.password, 
    userroutine: globalThis.routine
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate('local')(req, res, function(){
        res.redirect('/profiles');
      });
    }
  });
});

app.listen(8080, function(){
  console.log('Server started on port 8080')
})

// -----------------------------------------------x--------------------------------------

// const express = require('express');
// const bodyParser = require('body-parser');
// const ejs = require("ejs");
// const mongoose = require('mongoose');
// const session = require('express-session');
// const passport = require('passport');
// const passportLocalMongoose = require('passport-local-mongoose');
// const https = require('https');
// const axios = require("axios");
// const methodOverride = require('method-override');

// // const fetch = require('node-fetch');

// require('dotenv').config();

// const app = express();

// // initializing ejs, body-parser
// app.set('view engine', 'ejs');
// app.use(express.static("public"));
// app.use(bodyParser.urlencoded({
//   extended: true
// }));
// app.use(methodOverride('_method'));

// // intializing session
// app.use(session({
//   secret: "Workout Routine App.",
//   resave: false,
//   saveUninitialized: false
// }));

// // initializing passport and passport-session
// app.use(passport.initialize());
// app.use(passport.session()); //using passport to manage our session

// // mongoose connection with mongodb server
// mongoose.set("strictQuery", false); //to avoid deprication warning
// mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

// // Routine schema

// const routineSchema = new mongoose.Schema({
//   workout: String,
//   target_muscle: String,
//   sets: String,
//   reps: String
// });

// const Routine = mongoose.model("Routine", routineSchema);

// // user schema for authentication

// const userSchema = new mongoose.Schema({
//   email: String,
//   password: String,
//   userRoutine: routineSchema
// });

// userSchema.plugin(passportLocalMongoose);

// const User = new mongoose.model("User", userSchema);

// passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// Description = 'Power and Strength';

// app.get('/', function(req, res) {
//   res.render('home', {Description: Description});
// });

// app.get('/login', function(req, res){
//   res.render('login')
// });

// app.get('/signin', function(req, res){
//   res.render('signin')
// });

// app.get('/logout', function(req, res){
//   req.logout(function(err){
//     if (err){
//       console.log(err);
//     }
//   }) 
//   res.redirect("/");
// });

// app.get('/profiles', function(req, res){
//   if (req.isAuthenticated()) {
//     Routine.find({})
//     .then((dataFound) => {
//       res.render('profiles', {ex_routine: dataFound});
//       console.log(dataFound);
//     })
//     .catch((err) => {
//       console.log(err);
//     })
//     // res.render('profiles');
//   } else {
//     res.redirect("/login");
//   }
  
// });

// app.get('/update/:id', function(req, res){
//   Routine.findOne({workout:req.params.id})
//   .then((edit) => {
//     res.render('update', {edit});
//   })
//   .catch((err) => {
//     console.log(err);
//   })
// });

// app.get('/exercise', function(req, res){
//   res.render('exercise');
// });

// app.put('/update/:id', function(req, res){
//   Routine.updateOne({workout:req.params.id}, {
//     $set:{
//        "sets" : req.body.updated_sets,
//        "reps" : req.body.updated_reps
//     }
//   })
//   .then((edit) => {
//     res.redirect('/profiles');
//   })
//   .catch((err) => {
//     console.log(err);
//   })
// });

// app.delete('/profiles/:id', function(req, res){
//   Routine.deleteOne({workout:req.params.id})
//   .then((del) => {
//     res.redirect('/profiles');
//   })
//   .catch((err) => {
//     console.log(err);
//   })
// });

// app.post('/profiles', function profile(req, res){
//   const workoutName = req.body.workoutName;
//   const targetMuscle = req.body.muscleName;
  
//   const routine = new Routine({
//     workout: workoutName,
//     target_muscle: targetMuscle,
//     sets: "0", 
//     reps: "0"
//   });
//   routine.save();
  
//   res.redirect("/profiles");
//   return routine;
// });

// app.post('/exercise', function(req, res){
  
//   const options = {
//     method: 'GET',
//     url: 'https://exercises-by-api-ninjas.p.rapidapi.com/v1/exercises',
//     params: {muscle: req.body.targetmuscle},
//     headers: {
//       'X-RapidAPI-Key': process.env.RAPID_API_KEY,
//       'X-RapidAPI-Host': 'exercises-by-api-ninjas.p.rapidapi.com'
//     }
//   };
  
//   axios.request(options).then(function (response) {
//     // console.log(response.data);
//     // res.json(response.data)
//     let ex_data = response.data;
//     res.render('exercise_data', {ex_data: ex_data})
//   }).catch(function (error) {
//     console.error(error);
//   });
// });

// app.post('/signin', function(req, res){
//   User.register({username: req.body.username}, req.body.password, function(err, user){
//     if (err) {
//       console.log(err);
//       res.redirect('/signin');
//     } else {
//       passport.authenticate('local')(req, res, function(){
//         res.redirect('/profiles');
//       });
//     }
//   });
// });

// app.post('/login', function(req, res){

//   const user =  new User ({
//     username: req.body.username,
//     password: req.body.password, 
//     userroutine: routine
//   });

//   req.login(user, function(err){
//     if (err) {
//       console.log(err);
//     } else {
//       passport.authenticate('local')(req, res, function(){
//         res.redirect('/profiles');
//       });
//     }
//   });
// });

// app.listen(8080, function(){
//   console.log('Server started on port 8080')
// })


const express = require('express'),
  morgan = require('morgan'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const { check, validationResult } = require('express-validator');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

//mongoose.connect('mongodb://localhost:27017/myMoviesDB', {useNewUrlParser: true, useUnifiedTopology: true }); // connection to local database.
mongoose.connect(process.env.'mongodb+srv://CreatorOne:Fudgecake@mymoviesdb.8ajjr.mongodb.net/myMoviesDB?retryWrites=true&w=majority', {useNewUrlParser: true, useUnifiedTopology: true }); // connection to online databse
//middleware
//Access Control
app.use(cors());
//log requests to console
app.use(morgan('common'));
//look in public folder first for requests
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');




/*
app.post('/users', (req, res) => {
  res.send('Successful POST request creating a new user');
});*/



//Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birth_Date: Date
}*/
//Root Page
app.get('/', (req, res) => {
  res.send('Welcome to my movie club!');
});
//Look at the documentation
app.get('/documentation.html', (req, res) => {
});
//add new user
app.post('/users/new',
// Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
],(req, res) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({Username: req.body.name})
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.name + ' already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birth_Date: req.body.Birth_Date
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});
//Get director
app.get('/movies/director/:name',  passport.authenticate('jwt', { session: false }),(req, res) => {
  Movies.find({"Director.Name" : req.params.name})
    .then((director) => {
      res.json(director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
//Get movies
app.get('/movies',  /*passport.authenticate('jwt', { session: false })',*/ (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send("Error: " +err);
  });
});
//Get Movie by Title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }),(req, res) => {
  Movies.findOne({Title : req.params.Title})
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});
//Get Movies by Genre
app.get('/movies/genre/:genre', passport.authenticate('jwt', { session: false }),(req, res) => {
  Movies.find({"Genre.Name" : req.params.genre})
  .then((genre) => {
    res.json(genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});
// Get users by name
app.get('/users/:Username', passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOne({Username: req.params.Username})
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// Get a list of users
app.get('/users', passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// Update user info
app.put('/users/update/:ID',  passport.authenticate('jwt', { session: false }),
[
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
],(req, res) => {
  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOneAndUpdate({ _id: req.params.ID }, { $set:
    {
      Password: hashedPassword,
      Email: req.body.Email,
      Birth_Date: req.body.Birth_Date
    }
  },
  { new: true },
  (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });
// Add a movie to a users movielist
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username }, {
     $push: { Movies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});
// Remove a movie from a users movielist
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username }, {
     $pull: { Movies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});
// Delete User by ID
app.delete('/users/byid/:_ID', passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOneAndRemove({_id: req.params._ID})
  .then((_id)=> {
    if (!_id) {
      res.status(400).send(req.params._ID + ' was not found');
    } else {
      res.status(200).send(req.params._ID + ' was deleted.');
    }
  })
  .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});
// Delete a user by username
app.delete('/users/byname/:name', passport.authenticate('jwt', { session: false }),(req, res) => {
  Users.findOneAndRemove({Username: req.params.name })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.name + ' was not found');
      } else {
        res.status(200).send(req.params.name + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Error Trapping
app.use((req, res, next) => {
    res.status(404).send('Something Broke')
});
// listen for requests


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
console.log('Listening on Port ' + port);
});

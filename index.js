const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan'),
  mongoose = require('mongoose');
const app = express();

const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myMoviesDB', {useNewUrlParser: true, useUnifiedTopology: true });

//middleware
//log requests to console
app.use(morgan('common'));

//look in public folder first for requests
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

let auth = require('./auth.js')(app);
const passport = require('passport');
require('./passport.js');
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
  Birthday: Date
}*/
//Root Page
app.get('/', (req, res) => {
  res.send('Welcome to my movie club!');
});
//Look at the documentation
app.get('/documentation.html', (req, res) => {
});
//add new user
app.post('/users/new', [],(req, res) => {
  Users.findOne({Name: req.body.name})
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.name + ' already exists');
      } else {
        Users
          .create({
            Name: req.body.Name,
            Password: req.body.Password,
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
app.get('/movies/director/:name',  (req, res) => {
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
app.get('/movies',  passport.authenticate('jwt', { session: false }), (req, res) => {
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
app.get('/movies/:Title', (req, res) => {
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
app.get('/movies/genre/:genre', (req, res) => {
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
app.get('/users/:Name', (req, res) => {
  Users.findOne({Name: req.params.Name})
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// Get a list of users
app.get('/users', (req, res) => {
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
app.put('/users/update/:ID',  (req, res) => {
  Users.findOneAndUpdate({ _id: req.params.ID }, { $set:
    {
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Name: req.params.Username }, {
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({Name: req.params.Username }, {
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
app.delete('/users/byid/:_ID', (req, res) => {
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
app.delete('/users/byname/:name', (req, res) => {
  Users.findOneAndRemove({Name: req.params.name })
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
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

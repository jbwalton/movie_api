const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan');
const app = express();

//middleware
//log requests to console
app.use(morgan('common'));

//look in public folder first for requests
app.use(express.static('public'));

app.use(bodyParser.json());

let topMovies = [
  {
    title: 'Aliens',
    director:'Ridley Scott',
    birth:'September',
    death: 'Not Dead yet!',
    genre: 'Horror, Sci-fi'
  },
  {
    title: 'Star Dust',
    director:'Matthew Vaughn',
    birth:'September',
    death: 'Not Dead yet!',
    genre: 'Fantasy'
  },
  {
    title: 'The Kings Speech',
    director:'Tom Hooper',
    birth:'September',
    death: 'Not Dead yet!',
    genre: 'Drama'
  },
  {
    title: 'True Grit',
    director:'Cohen Brothers',
    birth:'September',
    death: 'Not Dead yet!',
    genre: 'Western'
  },
  {
    title: 'Bone Tomahawk',
    director:'S. Craig Zahler',
    birth:'September',
    death: 'Not Dead yet!',
    genre: 'Western'
  },
  {
    title: 'The Shawshank Redemption',
    director:'Frank Darabone',
    birth:'September',
    death: 'Not Dead yet!',
    genre: 'Drama'
  },
  {
    title: 'Pulp Fiction',
    director:'Quentin Tarantino',
    birth:'September',
    death: 'Not Dead yet!',
    genre: 'Action'
  },
  {
    title: 'Fight Club',
    director:'David FIncher',
    birth:'September',
    death: 'Not Dead yet!',
    genre: 'Action'
  },
  {
    title: 'Forest Gump',
    director:'Robert Zemeckis',
    birth:'September',
    death: 'Not Dead yet!',
    genre: 'Action'
  },
  {
    title: 'Citizen Kane',
    director:'Orson Wells',
    birth:'September',
    death: '1950',
    genre: 'Action'
  }
];

//Set up mostly empty user array
let users=[
  {
    user: 'Sample User',
    favourites: {
      {title:'Fight Club'},{title:'Forest Gump'}
    }
  }
];

// GET requests

//Root Page
app.get('/', (req, res) => {
  res.send('Welcome to my movie club!');
});

//Look at the documentation
app.get('/documentation.html', (req, res) => {
});

//List All Movies
app.get('/movies', (req, res) => {
  res.json(topMovies);
});

//get movie details by name
app.get('/movies/title/:title', (req, res) => {
  let isFilm=(topMovies.find((search) =>
    { return search.title === req.params.title }));
    if (isFilm){
      res.send(isFilm);
    } else {
      res.send('title not found');
    }
});

//Get director Biography by name
app.get('/movies/director/:director', (req, res) => {
  let isDirector=(topMovies.find((search) =>
    { return search.director === req.params.director }));
    if (isDirector){
      res.send('found director ' + isDirector.director + ' born ' + isDirector.birth + ', died ' + isDirector.death);
    } else {
      res.send('director not found');
    }

});

//get movie genre by name
app.get('/movies/genre/:title', (req, res) => {
  let isFilm=(topMovies.find((search) =>
    { return search.title === req.params.title }));
    if (isFilm){
      res.send('found title ' + req.params.title + ', genre is:' + isFilm.genre);
    } else {
      res.send('title not found');
    }
});

//add to User favourites
app.post('/users/addmovie/:user/:favourites', (req, res) => {
    res.status(201).send('Successfully added to favourites');
});

//add new User
app.post('/users/add/:user', (req, res) => {
      res.status(201).send('Successfully added new User to users');
});

//delete User
app.delete('/users/delete/:user', (req, res) =>{
      res.status(201).send('Successfully deleted users');
});

//delete User Favourites
app.delete('/users/deletemovie/:user/:favourites', (req, res) => {
    res.status(201).send('Successfully deleted from favourites');
});

//Error Trapping
app.use((req, res, next) => {
    res.status(404).send('Something Broke')
});
// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

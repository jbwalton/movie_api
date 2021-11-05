const express = require('express'),
  morgan = require('morgan');
const app = express();

//middleware
//log requests to console
app.use(morgan('common'));

//look in public folder first for requests
app.use(express.static('public'));

let topMovies = [
  {
    title: 'Aliens',
    director: 'Ridley Scott'
  },
  {
    title: 'Star Dust',
    director: 'Matthew Vaughn'
  },
  {
    title: 'The Kings Speech',
    director: 'Tom Hooper'
  },
  {
    title: 'True Grit',
    director: 'Cohen Brothers'
  },
  {
    title: 'Bone Tomahawk',
    director: 'S. Craig Zahler'
  },
  {
    title: 'The Shawshank Redemption',
    director: 'Frank Darabone'
  },
  {
    title: 'Pulp Fiction',
    director: 'Quentin Taratino'
  },
  {
    title: 'Fight Club',
    director: 'David FIncher'
  },
  {
    title: 'Forest Gump',
    director: 'Robert Zemeckis'
  },
  {
    title: 'Once upon a time in Hollywood',
    director: 'Quentin Taratino'
  }
];

// GET requests
app.get('/', (req, res) => {
  res.send('Welcome to my movie club!');
});

app.get('/documentation.html', (req, res) => {
});

app.get('/movies', (req, res) => {
  res.json(topMovies);
});

//Error Trapping
app.use((req, res, next) => {
    res.status(404).send('Something Broke')
});
// listen for requests
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});

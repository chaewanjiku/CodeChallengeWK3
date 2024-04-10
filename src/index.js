let URL = 'http://localhost:3000'
const movieList = document.getElementById('films');

document.addEventListener('DOMContentLoaded', () => {
  document.getElementsByClassName('film item')[0].remove();
  fetchMovieDetails(URL);
  fetchMovies(URL);
});

function fetchMovieDetails(URL) {
  fetch(`${URL}/films/1`)
    .then((response) => response.json())
    .then((data) => {
      setUpMovieDetails(data);
    });
}

function fetchMovies(URL) {
  fetch(`${URL}/films`)
    .then((resp) => resp.json())
    .then((movies) => {
      movies.forEach((movie) => {
        displayMovie(movie);
      });
    });
}

function displayMovie(movie) {
    const list = document.createElement('li');
    list.classList.add('film', 'item');
    list.style.cursor = 'pointer';
    list.textContent = movie.title;
    list.dataset.id = movie.id; 
  
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-btn');
    list.appendChild(deleteButton);
  
    movieList.appendChild(list);
  
    // Event listener for delete button
    deleteButton.addEventListener('click', (event) => {
      event.preventDefault(); 
      const confirmDelete = confirm('Are you sure you want to delete this film?');
      if (confirmDelete) {
        deleteFilm(movie.id);
      }
    });
  
    list.addEventListener('click', () => {
      fetch(`${URL}/films/${movie.id}`)
        .then((res) => res.json())
        .then((movieData) => {
          document.getElementById('buy-ticket').textContent = 'Buy Ticket';
          setUpMovieDetails(movieData);
        });
    });
  
    // Check if the movie is sold out and update the list item
    if (movie.tickets_sold >= movie.capacity) {
      list.classList.add('sold-out');
    }
  }

function setUpMovieDetails(funMovie) {
  const preview = document.getElementById('poster');
  preview.src = funMovie.poster;

  const movieTitle = document.querySelector('#title');
  movieTitle.textContent = funMovie.title;

  const movieTime = document.querySelector('#runtime');
  movieTime.textContent = `${funMovie.runtime} minutes`;

  const movieDescription = document.querySelector('#film-info');
  movieDescription.textContent = funMovie.description;

  const showTime = document.querySelector('#showtime');
  showTime.textContent = funMovie.showtime;

  const remainingTickets = document.querySelector('#ticket-num');
  remainingTickets.textContent = funMovie.capacity - funMovie.tickets_sold;

  const buyTicketButton = document.getElementById('buy-ticket');
  buyTicketButton.addEventListener('click', (event) => {
    event.preventDefault();
    if (remainingTickets.textContent > 0) {
      remainingTickets.textContent = parseInt(remainingTickets.textContent, 10) - 1;
      // Update tickets_sold on the server
      fetch(`${URL}/films/${funMovie.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickets_sold: funMovie.tickets_sold + 1,
        }),
      });
      // Record ticket purchase
      fetch(`${URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          film_id: funMovie.id,
          number_of_tickets: 1,
        }),
      });
    } else {
      buyTicketButton.textContent = 'Sold Out';
    }
  });
}

// Delete film functionality (Bonus)
function deleteFilm(id) {
    fetch(`${URL}/films/${id}`, {
      method: 'DELETE',
    })
      .then(() => {
        const filmItem = document.querySelector(`#films li[data-id="${id}"]`);
        filmItem.remove();
      })
      .catch((error) => console.error('Error deleting film:', error));
}

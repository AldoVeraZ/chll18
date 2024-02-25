// Variable global para almacenar las películas
let movies = [];
let currentPage = 1; // Variable global para la página actual

// Función para cargar películas desde un archivo JSON local
async function fetchMovies() {
  try {
    const response = await fetch("movies.json");
    if (!response.ok) {
      throw new Error("Failed to fetch movies");
    }
    const data = await response.json();
    movies = data.movies; // Almacenar películas en la variable global
    return movies;
  } catch (error) {
    console.error(error);
  }
}

// Función para mostrar películas en la página
function displayMovies(movies) {
  const moviesSection = document.getElementById("movies");
  const searchInput = document.getElementById("search-input");
  const yearFilter = document.getElementById("year-filter");

  // Verificar si hay términos de búsqueda o filtro de año seleccionado
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedYear = yearFilter.value;

  // Filtrar películas según los términos de búsqueda y el filtro de año
  let filteredMovies = filterMoviesByTitle(movies, searchTerm);
  filteredMovies = selectedYear
    ? filterMoviesByYear(filteredMovies, selectedYear)
    : filteredMovies;

  // Limpiar contenido previo
  moviesSection.innerHTML = "";

  // Mostrar películas
  const moviesPerPage = 15; // Número máximo de películas por página
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  // Calcular el índice de inicio y fin para las películas en la página actual
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const currentMovies = filteredMovies.slice(startIndex, endIndex);

  // Crear y mostrar tarjetas de películas
  currentMovies.forEach((movie, index) => {
    const movieCard = createMovieCard(movie);
    moviesSection.appendChild(movieCard);
  });

  // Mostrar mensaje si no hay películas encontradas (solo si se realiza una búsqueda activa)
  if (searchTerm !== "" && filteredMovies.length === 0) {
    displayNoResults("La película no se encuentra en el registro!");
  }

  // Mostrar paginación
  displayPagination(totalPages);
}

// Función para crear una tarjeta de película
function createMovieCard(movie) {
  const movieCard = document.createElement("div");
  movieCard.classList.add("movie-card");

  const img = document.createElement("img");
  img.src = movie.img;
  img.alt = movie.title;

  const content = document.createElement("div");
  content.classList.add("movie-card-content");

  const title = document.createElement("h2");
  title.textContent = `${movie.title} (${movie.year})`;

  const description = document.createElement("p");
  description.textContent = movie.description;

  content.appendChild(title);
  content.appendChild(description);

  movieCard.appendChild(img);
  movieCard.appendChild(content);

  return movieCard;
}

function displayPagination(totalPages) {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.addEventListener("click", () => {
      currentPage = i;
      displayMovies(movies);
    });
    if (i === currentPage) {
      button.classList.add("active");
    }
    paginationContainer.appendChild(button);
  }

  // Agregar botón para ir a la página anterior
  const prevButton = document.createElement("button");
  prevButton.textContent = "◀";
  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      displayMovies(movies);
    }
  });
  paginationContainer.insertBefore(prevButton, paginationContainer.firstChild);

  // Agregar botón para ir a la página siguiente
  const nextButton = document.createElement("button");
  nextButton.textContent = "▶";
  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayMovies(movies);
    }
  });
  paginationContainer.appendChild(nextButton);
}

// Función para poblar las opciones del filtro por año
function populateYearFilterOptions(movies) {
  const yearFilter = document.getElementById("year-filter");
  yearFilter.innerHTML = ""; // Limpiar opciones existentes

  // Agregar opción por defecto "Sin seleccionar"
  const defaultOption = document.createElement("option");
  defaultOption.value = ""; // Valor vacío
  defaultOption.textContent = "Sin seleccionar"; // Texto descriptivo
  yearFilter.appendChild(defaultOption);

  const years = movies.map((movie) => movie.year);
  const uniqueYears = [...new Set(years)]; // Obtener años únicos
  uniqueYears.sort((a, b) => b - a); // Ordenar años en orden descendente
  uniqueYears.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

// Función para filtrar películas por título
function filterMoviesByTitle(movies, searchTerm) {
  searchTerm = searchTerm.trim().toLowerCase();
  return movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchTerm)
  );
}

// Función para filtrar películas por año
function filterMoviesByYear(movies, year) {
  return movies.filter((movie) => movie.year === parseInt(year));
}

// Función para manejar la entrada de búsqueda
function handleSearchInput() {
  const searchInput = document.getElementById("search-input");

  // Función para filtrar y mostrar películas
  function filterAndDisplayMovies() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const filteredMovies = filterMoviesByTitle(movies, searchTerm);
    displayMovies(filteredMovies);
  }

  // Escuchar el evento input para cambios en el campo de búsqueda
  searchInput.addEventListener("input", filterAndDisplayMovies);

  // Escuchar el evento keyup para verificar si se presiona la tecla de retroceso (backspace)
  searchInput.addEventListener("keyup", () => {
    if (searchInput.value.trim() === "") {
      displayMovies([]); // Si el campo está vacío, borramos los resultados de la búsqueda
    }
  });
}

// Función para manejar el filtro por año
function handleYearFilter() {
  const yearFilter = document.getElementById("year-filter");
  yearFilter.addEventListener("change", () => {
    const selectedYear = yearFilter.value;
    if (selectedYear === "") {
      displayMovies(movies);
    } else {
      const filteredMovies = filterMoviesByYear(movies, selectedYear);
      displayMovies(filteredMovies);
    }
  });
}

// Función para agregar una nueva película
function addMovie(title, description, year, imgUrl) {
  // Verificar si el título de la película ya existe
  const existingMovie = movies.find(
    (movie) => movie.title.toLowerCase() === title.toLowerCase()
  );

  if (existingMovie) {
    // Mostrar un toast indicando que la película ya existe
    displayToast("La película ya existe en la lista.");
    return; // Salir de la función sin agregar la película
  }

  // Si el título no existe, agregar la película
  const movie = {
    title: title,
    description: description,
    year: parseInt(year),
    img: imgUrl,
  };
  // Agregar la nueva película al array de películas
  movies.push(movie);

  // Guardar la lista de películas en el almacenamiento local del navegador
  localStorage.setItem("movies", JSON.stringify(movies));

  // Actualizar el filtro por año solo si el año de la película nueva es diferente
  const yearFilter = document.getElementById("year-filter");
  if (!yearFilter.querySelector(`option[value="${year}"]`)) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  }

  // Mostrar un toast de confirmación
  displayToast("Película agregada exitosamente.");

  // Resetear el formulario para limpiar los campos
  const addMovieForm = document.getElementById("add-movie-form");
  addMovieForm.reset();

  // Actualizar la pantalla con la película recién agregada
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filteredMovies = filterMoviesByTitle(movies, searchTerm);
  displayMovies(filteredMovies);

  // Actualizar opciones de filtro y manejar búsqueda nuevamente
  populateYearFilterOptions(movies);
  handleSearchInput();

  // Retrasar la recarga de la página después de mostrar el mensaje de confirmación
  setTimeout(() => {
    location.reload();
  }, 2000); // Esperar 2 segundos (ajusta según necesites)
}

// Función para manejar el envío del formulario para agregar una nueva película
function handleAddMovieFormSubmission() {
  const addMovieForm = document.getElementById("add-movie-form");
  addMovieForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevenir el envío de formulario predeterminado
    // Obtener los valores del formulario
    const title = addMovieForm.elements["title"].value;
    const description = addMovieForm.elements["description"].value;
    const year = addMovieForm.elements["year"].value;
    const imgUrl = addMovieForm.elements["imgUrl"].value;
    // Agregar la nueva película y evitar el envío predeterminado del formulario
    addMovie(title, description, year, imgUrl);
    // Ocultar el formulario después de agregar la película
    hideAddMovieForm();
    // Actualizar la URL para mostrar la lista de películas
    window.location.hash = "#";
  });
}

// Función para manejar la navegación y actualizar el historial del navegador
function handleNavigation() {
  const hash = window.location.hash;
  if (hash === "#add") {
    // Mostrar el formulario para agregar una nueva película
    showAddMovieForm();
  } else {
    // Mostrar la lista de películas
    displayMovies(movies);
  }
}

// Función para mostrar el formulario para agregar una nueva película
function showAddMovieForm() {
  const addMovieFormContainer = document.getElementById(
    "add-movie-form-container"
  );
  addMovieFormContainer.style.display = "block";
}

// Función para ocultar el formulario para agregar una nueva película
function hideAddMovieForm() {
  const addMovieFormContainer = document.getElementById(
    "add-movie-form-container"
  );
  addMovieFormContainer.style.display = "none";
}

// Función para inicializar la aplicación
async function init() {
  await fetchMovies();
  populateYearFilterOptions(movies);
  handleSearchInput();
  handleYearFilter();

  // Mostrar las películas al cargar la página
  displayMovies(movies);

  // Obtener las películas del almacenamiento local si existen
  const storedMovies = JSON.parse(localStorage.getItem("movies"));
  if (storedMovies) {
    movies = storedMovies;
    displayMovies(movies); // Mostrar las películas recuperadas
    populateYearFilterOptions(movies); // Actualizar el filtro de años
  }
}

// Llamar a la función init cuando se carga el contenido DOM
document.addEventListener("DOMContentLoaded", () => {
  handleAddMovieFormSubmission();
  init(); // Inicializar la aplicación después de configurar el formulario
  handleNavigation(); // Manejar la navegación inicial al cargar la página
});

// Escuchar los cambios en el URL (hash) y manejar la navegación correspondiente
window.addEventListener("hashchange", handleNavigation);

// Función para mostrar un mensaje cuando no se encuentran productos o cuando el campo de búsqueda está vacío
function displayNoResults(message) {
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.textContent = message;
  toastMessage.classList.add("show");

  // Ocultar el mensaje de toast después de unos segundos
  setTimeout(function () {
    toastMessage.classList.remove("show");
  }, 3000); // Mostrar durante 3 segundos (ajusta según necesites)
}

// Función para mostrar un toast
function displayToast(message) {
  const toastMessage = document.getElementById("toastMessage");
  toastMessage.textContent = message;
  toastMessage.classList.add("show");

  // Ocultar el mensaje de toast después de unos segundos
  setTimeout(function () {
    toastMessage.classList.remove("show");
  }, 3000); // Mostrar durante 3 segundos (ajusta según necesites)
}

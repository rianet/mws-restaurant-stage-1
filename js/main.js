let restaurants, neighborhoods, cuisines;
var map;
var markers = [];

DBHelper._dbPromise = DBHelper.openDatabase();

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  self.neighborhoods = DBHelper.fetchNeighborhoods();
  fillNeighborhoodsHTML();
};

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  self.cuisines = DBHelper.fetchCuisines();
  fillCuisinesHTML();
};

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize Google map, called from HTML.
 */
initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
};

/**
 * Display cached restaurants
 */
showCachedRestaurants = () => {
  DBHelper._dbPromise.then((db) => {
    if (!db) return;

    let index = db.transaction('restaurants')
      .objectStore('restaurants');

    index.getAll().then((data) => {
      if (data.length) {
        DBHelper.restaurantData = data;
        fetchCuisines();
        fetchNeighborhoods();
        updateRestaurants();
      } else {
        // If no cached data on indexedDB fetch from server
        DBHelper.fetchRestaurants().then(() => {
          fetchCuisines();
          fetchNeighborhoods();
          updateRestaurants();
        });

        DBHelper.fetchReviews();
      }
    });
  });
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cuisine = getSelectedCusine();
  const neighborhood = getSelectedNeighborhood();
  const restaurants = DBHelper.fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood
  );
  resetRestaurants(restaurants);
  fillRestaurantsHTML();
};

/*
 * Get selected cusine
 */
getSelectedCusine = () => {
  const cSelect = document.getElementById('cuisines-select');
  const cIndex = cSelect.selectedIndex;
  return cSelect[cIndex].value;
};

/*
 * Get selected neighborhood
*/
getSelectedNeighborhood = () => {
  const nSelect = document.getElementById('neighborhoods-select');
  const nIndex = nSelect.selectedIndex;
  return nSelect[nIndex].value;
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  ul.setAttribute(
    'aria-label',
    `List of ${getSelectedCusine()} food within ${getSelectedNeighborhood()} neighborhood`
  );
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  // addMarkersToMap();
};

favoriteRestaurant = (event) => {
  DBHelper.favoriteRestaurant(event.target.restaurant).then(response => {
    if (response.is_favorite) {
      DBHelper.showNotification(`Restaurant ${response.name} is now your favorite!`);
      event.target.classList.add('favorite-button-selected');
      event.target.parentElement.classList.add('favorite-restaurant');
    } else {
      DBHelper.showNotification(`Restaurant ${response.name} no longer your favorite`);
      event.target.classList.remove('favorite-button-selected');
      event.target.parentElement.classList.remove('favorite-restaurant');
    }
  });
};

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = restaurant => {
  const li = document.createElement('li');
  (restaurant.is_favorite) ? li.classList.add('favorite-restaurant') : li.classList.remove('favorite-restaurant');

  const favorite = document.createElement('span');
  favorite.innerHTML = '❤';
  favorite.classList.add('favorite-button');
  favorite.setAttribute('role', 'button');
  favorite.setAttribute('aria-label', `Mark restaurant ${restaurant.name} as favorite`);
  (restaurant.is_favorite) ? favorite.classList.add('favorite-button-selected') : favorite.classList.remove('favorite-button-selected');
  favorite.restaurant = restaurant;
  favorite.addEventListener('click', favoriteRestaurant, false);
  li.append(favorite);

  li.append(createImg(restaurant));

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.setAttribute('aria-label', `View restaurant ${restaurant.name}`);
  more.href = DBHelper.urlForRestaurant(restaurant);
  li.append(more);

  return li;
};

createImg = restaurant => {
  const picture = document.createElement('picture');
  const imgPath = DBHelper.imageUrlForRestaurant(restaurant);

  const sourceWebp = document.createElement('source');
  sourceWebp.type = 'image/webp';
  sourceWebp.srcset = `${imgPath}.webp`;

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.alt = `Restaurant ${restaurant.name}`;
  image.src = `${imgPath}-800.jpg`;
  image.sizes = '(max-width: 960px) 50vw, 100vw';
  image.srcset = [`${imgPath}-400.jpg 400w`, `${imgPath}-800.jpg 800w`];

  // Append sources to picrure
  picture.append(sourceWebp);
  picture.append(image);

  return picture;
};

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url;
    });
    self.markers.push(marker);
  });
};

window.addEventListener('load', () => {
  showCachedRestaurants();
});

showMap = () => {
  document.getElementById('map').style.display = 'block';
  document.getElementById('mapImg').style.display = 'none';
  initMap();
  addMarkersToMap();
};

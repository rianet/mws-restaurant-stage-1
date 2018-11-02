let restaurant, review;
var map;
DBHelper._dbPromise = DBHelper.openDatabase();

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
  // Fetch restaurant reviews
  fetchReviewsFromURL((error, reviews) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      fillReviewsHTML();
    }
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = callback => {
  DBHelper._dbPromise.then((db) => {
    let index = db.transaction('restaurants')
      .objectStore('restaurants');

    index.getAll().then((data) => {
      DBHelper.restaurantData = data;
      const id = getParameterByName('id');
      self.restaurant = DBHelper.fetchRestaurantById(id);
      callback(null, self.restaurant);
      fillRestaurantHTML();
    });
  });
};

/**
 * Get current restaurant from page URL.
 */
fetchReviewsFromURL = callback => {
  DBHelper._dbPromise.then((db) => {
    let index = db.transaction('reviews')
      .objectStore('reviews');

    index.getAll().then((data) => {
      DBHelper.reviewsData = data;
      const restaurantId = getParameterByName('id');
      self.reviews = DBHelper.fetchReviewsByRestaurantId(restaurantId);
      callback(null, self.reviews);
    });
  });
};


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name + '<span id="details-favorite-btn" role="button" aria-label="Favorite restaurant">❤</span>';

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const imgPath = DBHelper.imageUrlForRestaurant(restaurant);

  const sourceWebp = document.getElementById('source-webp');
  sourceWebp.srcset = `${imgPath}.webp`;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.alt = `Restaurant ${restaurant.name}`;
  image.src = `${imgPath}-800.jpg`;
  image.sizes = '(max-width: 960px) 50vw, 100vw';
  image.srcset = [`${imgPath}-400.jpg 400w`, `${imgPath}-800.jpg 800w`];

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  setFavoriteStyles(restaurant);
};

/**
 * Set favorite styles
 */
setFavoriteStyles = (restaurant) => {
  const container = document.getElementById('restaurant-container');
  const favorite = document.getElementById('details-favorite-btn');
  if (restaurant.is_favorite) {
    container.classList.add('details-favorite-restaurant');
    favorite.style.display = 'block';
  } else {
    container.classList.remove('details-favorite-restaurant');
    favorite.style.display = 'none';
  }
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (
  operatingHours = self.restaurant.operating_hours
) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = review => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.className = 'reviewer-name';
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = new Date(review.updatedAt).toLocaleDateString();
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.setAttribute('aria-label', `Rated with ${review.rating} stars`);
  rating.className = 'raiting';
  for (let i = 0; i < review.rating; i++) {
    rating.innerHTML += '★';
  }
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.setAttribute('aria-current', restaurant.name);
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

/**
 * Mark restaurant as favorite.
 */
favoriteRestaurant = () => {
  DBHelper.favoriteRestaurant(self.restaurant).then(response => {
    setFavoriteStyles(response);
    if (response.is_favorite) {
      DBHelper.showNotification(`Restaurant ${response.name} is now your favorite!`);
    } else {
      DBHelper.showNotification(`Restaurant ${response.name} no longer your favorite`);
    }
  });
};

/*
 * Display review form to add restaurant raiting
 */
showReviewForm = () => {
  document.getElementById('review-form').style.display = 'block';
  document.getElementById('btn-show-review-form').style.display = 'none';
};

/*
 * Get selected raiting
 */
getSelectedRaiting = () => {
  const cSelect = document.getElementById('select-raiting');
  const cIndex = cSelect.selectedIndex;
  return cSelect[cIndex].value;
};

/*
 * Append new entered restaurant review to list of reviews
 */
appendReviewHTML = (review) => {
  const container = document.getElementById('reviews-container');
  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));
  container.appendChild(ul);
};

/*
 * Submit a review and store it on indexedDB first
 */
submitReview = () => {
  event.preventDefault();
  review = {
    'id': Date.now(),
    'restaurant_id': getParameterByName('id'),
    'name': document.getElementById('txt-name').value,
    'rating': getSelectedRaiting(),
    'comments': document.getElementById('txt-comment').value,
    'createdAt': Date.now(),
    'updatedAt': Date.now(),
    // Set flag to check if added while offline, to later update when online
    'syncUp': !navigator.onLine
  }

  DBHelper.storeReviewIDB(review).then(response => {
    DBHelper.showNotification('Your review was added!');
    document.getElementById('review-form').reset();
    document.getElementById('review-form').style.display = 'none';
    document.getElementById('btn-show-review-form').style.display = 'block';
    self.reviews.push(review);
    appendReviewHTML(review);
  });
};

/*
 * Get list of not sync up reviews with server
 */
getReviewsToSyncUp = () => {
  return self.reviews.filter(review => review.syncUp === false);
};

/*
 * Listens when the window has loaded
 */
window.addEventListener('load', () => {
  // Check if app is online
  window.addEventListener('online', () => {
    const reviewsToPost = this.getReviewsToSyncUp();
    // Check if there are reviews pending to sync up (in case of added while offline)
    if (reviewsToPost.length > 0) {
      DBHelper.showNotification('Back online and syncronizing your unsaved data!');
      // Post pending reviews to be sync up
      DBHelper.syncUpReviews(reviewsToPost);
    }
  });
  // Check if app is offline and inform user
  window.addEventListener('offline', () => {
    DBHelper.showNotification('You are offline we\'ll sync up your data when back online!');
  });
});

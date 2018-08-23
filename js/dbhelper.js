/**
 * Common database helper functions.
 */
class DBHelper {
  
  constructor() {
    this.restaurantData = {};
    this.dbPromise = idb.open('restaurants-db', 1, upgradeDB => {
      upgradeDB.createObjectStore('restaurants', { keyPath: 'id' });
    });
  }

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}/`;
  }

  static openDatabase() {
    // If the browser doesn't support service worker, no need to use indexedDB
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }
  
    return idb.open('restaurants-db', 1, upgradeDB => {
      var store = upgradeDB.createObjectStore('restaurants', {
        keyPath: 'id'
      });
    });
  }

   /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    var promise = new Promise(function(resolve, reject) {
      fetch(`${DBHelper.DATABASE_URL}restaurants`, {
      }).then(restaurants => {
        return restaurants.json();      
      }).then((data) => {
        // Store restaurants on indexedDB
        DBHelper._dbPromise.then(function(db) {
          if (!db) return;
          var tx = db.transaction('restaurants', 'readwrite');
          var store = tx.objectStore('restaurants');
          data.forEach((item) => {
            store.put(item);
          });
    
          DBHelper.restaurantData = data;
        });
        resolve(data);
      });
    });
    return promise;
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    return DBHelper.restaurantData.find(r => r.id == id);
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
        // Filter restaurants to have only given cuisine type
    return DBHelper.restaurantData.filter(r => r.cuisine_type == cuisine);
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    return DBHelper.restaurantData.filter(r => r.neighborhood == neighborhood);
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood
  ) {
    if(DBHelper.restaurantData !== undefined) {
      let results = DBHelper.restaurantData;
      if (cuisine !== 'all') {
        // filter by cuisine
        results = results.filter(r => r.cuisine_type == cuisine);
      }
      if (neighborhood !== 'all') {
        // filter by neighborhood
        results = results.filter(r => r.neighborhood == neighborhood);
      }       
     return results;
    }
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    if(DBHelper.restaurantData !== undefined) {
      // Get all neighborhoods from all restaurants
      const neighborhoods = this.restaurantData.map((v) => v.neighborhood);

      // Remove duplicates from neighborhoods
      return neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
    }
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    if(DBHelper.restaurantData !== undefined) {
      // Get all cuisines from all restaurants
      const cuisines = this.restaurantData.map((v, i) => v.cuisine_type);
      
      // Remove duplicates from cuisines
      return cuisines.filter((v, i) => cuisines.indexOf(v) == i);
    }
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return `./restaurant.html?id=${restaurant.id}`;
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return `/img/${restaurant.photograph}`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP
    });
    return marker;
  }
}

let restaurant;var map;DBHelper._dbPromise=DBHelper.openDatabase(),window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),fetchRestaurantFromURL=(e=>{DBHelper._dbPromise.then(t=>{t.transaction("restaurants").objectStore("restaurants").getAll().then(t=>{DBHelper.restaurantData=t;const n=getParameterByName("id");self.restaurant=DBHelper.fetchRestaurantById(n),e(null,self.restaurant),fillRestaurantHTML()})})}),fillRestaurantHTML=((e=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=DBHelper.imageUrlForRestaurant(e);document.getElementById("source-webp").srcset=`${t}.webp`;const n=document.getElementById("restaurant-img");n.className="restaurant-img",n.alt=`Restaurant ${e.name}`,n.src=`${t}-800.jpg`,n.sizes="(max-width: 960px) 50vw, 100vw",n.srcset=[`${t}-400.jpg 400w`,`${t}-800.jpg 800w`],document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");for(let n in e){const r=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,r.appendChild(a);const s=document.createElement("td");s.innerHTML=e[n],r.appendChild(s),t.appendChild(r)}}),fillReviewsHTML=((e=self.restaurant.reviews)=>{const t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const r=document.getElementById("reviews-list");e.forEach(e=>{r.appendChild(createReviewHTML(e))}),t.appendChild(r)}),createReviewHTML=(e=>{const t=document.createElement("li"),n=document.createElement("p");n.className="reviewer-name",n.innerHTML=e.name,t.appendChild(n);const r=document.createElement("p");r.innerHTML=e.date,t.appendChild(r);const a=document.createElement("p");a.setAttribute("aria-label",`Rated with ${e.rating} stars`),a.className="raiting";for(let t=0;t<e.rating;t++)a.innerHTML+="★";t.appendChild(a);const s=document.createElement("p");return s.innerHTML=e.comments,t.appendChild(s),t}),fillBreadcrumb=((e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),n=document.createElement("li");n.setAttribute("aria-current",e.name),n.innerHTML=e.name,t.appendChild(n)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null});
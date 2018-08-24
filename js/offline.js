// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function () { console.log("Service Worker Registered"); })
      .catch(function (error) { console.log('Registration failed with ' + error); });
  }
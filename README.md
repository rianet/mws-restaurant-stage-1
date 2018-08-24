# Mobile Web Specialist Certification Course
---
#### _Three Stage Course Material Project - Restaurant Reviews_

## Project Stage 1
For the Restaurant Reviews projects, we incrementally converted a static webpage to a mobile-ready web application. We took a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. We also added a service worker to begin the process of creating a seamless offline experience for your users.

## Project Stage 2
For Stage 2 we focused on performance, we fetch Restaurants from API and used indexedDB to cache responses. Implemented usage of Workbox to enhance offline capabilities and at the same target following scores with Lighthouse audit:
`Progressive Web App: >90`
`Performance: >70`
`Accessibility: >90`

## Running this Project

### Prerequisites
1. [Node](https://nodejs.org/en/) v8.x+
2. [NPM](https://www.npmjs.com/) v6.x+
3. [Gulp](https://gulpjs.com/) v3.9+
4. [Python](https://www.python.org/) v2.x+
5. [Sails](https://sailsjs.com/get-started) 

### Backend Development Server
In order to make APIs work correctly:

1. Clone https://github.com/udacity/mws-restaurant-stage-2
2. Install sails globally `npm i -g sails`
3. Run the server `node server.js`

### Frontend Development server
1. Run `npm install` to include the dependencies in the project
2. To run the server in the terminal check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 8000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 8000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.
3. With your server running, visit the site: `http://localhost:8000` to see app in action




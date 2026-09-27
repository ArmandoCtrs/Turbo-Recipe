# Turbo Recipe

Authors: Albert Cantoria, Armando Contreras, Muctarr Mansaray, and Michael Oltarzewski

Features:

* Browse existing recipes 
    * Search by name, username, tags 
    * Save recipe to user’s shopping list 
* Perform CRUD operations on recipes (name, ingredients list, instructions, tags) 
* Export a shopping list based on their saved recipes.
* Communicate with an AI chatbot to get recipe recommendations based on ingredients they have.

## Running

### Development mode

Dev mode is for when you want to make changes to the code and see them update in real-time in the browser.

To run the backend dev server:

```sh
npm run dev:server
```

Then, in another terminal window, run the frontend dev server:

```sh
npm run dev:client
```

### Production mode

Production mode is for real-life demonstrations of the code. When we deploy the app,
it will use production mode.

The production server will run both the backend API, as well as host the web pages.

```
npm run build
npm run start
```
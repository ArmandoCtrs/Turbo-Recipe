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

**Note:** For more details, refer to `/docs/DEVELOPMENT.md`.

### Development mode

To run the backend dev server:

```sh
npm run dev:server
```

Then, in another terminal window, run the frontend dev server:

```sh
npm run dev:client
```

### Production mode

The production server will run both the backend API, as well as host the web pages.

```
npm run build
npm run start
```
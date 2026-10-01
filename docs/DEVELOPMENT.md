# Development guide

## Tools needed

You will need to install the following tools:
- Node (https://nodejs.org/en/download/)
	- NPM, the package manager for Node, should be included if you use the installer.
- Git for Windows (https://git-scm.com/install/windows)
    - Or, if working on Mac or Linux, install the appropriate version of Git.

## App modes

There are two different modes you can run the app in:

* **Production mode:** The final, working copy of our app.
* **Development (dev) mode:** A work-in-progress copy of our app optimized for active development.

Here are some pros and cons:
* Production mode
    * Involves a building process, which is slow, but optimizes the app to make it speedy.
    * This makes it ideal when we deploy the app to another service (like AWS).
    * It only requires one server to host both the backend server and the web app.
    * Generally, you cannot modify the build files. You have to rebuild and restart the app
      every time you make changes.
* Dev mode
    * No building process. The app is hosted "live".
    * Not optimized, and not ideal for deployment.
    * Must run the backend and frontend dev servers independently.
    * Making changes to the code will automatically update in the browser. No server restart
      is required.

## Running the app

To start, `cd` into the app folder, and install packages using `npm`:
```sh
cd Turbo-Recipe
npm install
```

### Development mode

To run in development mode, you must run the backend dev server and the frontend dev server
in two separate terminal windows.

**Backend** (terminal 1):

```sh
npm run dev:server
```

**Frontend** (terminal 2):

```sh
npm run dev:client
```

Then, the relevant endpoints will be:
* API: [`http://localhost:3001/api/`](http://localhost:3001/api/)
* Web: [<code>http://localhost:<b>5173</b>/</code>](http://localhost:5173/)

### Production mode

To run in production mode, you must run the build and start scripts.

```
npm run build
npm run start
```

Then, the relevant endpoints will be:
* API: [`http://localhost:3001/api/`](http://localhost:3001/api/)
* Web: [<code>http://localhost:<b>3001</b>/</code>](http://localhost:3001/)

**Note:** In production mode, there is only one server, so the web address is at port `:3001`,
not `:5173`.

* **Why?** The dev server comes with Vite, our bundling software, and their default port is 
  `:5173`. 
* But when we build for production, there's no need to use Vite for a dev server, so we just 
  host the files ourselves on port `:3001`.
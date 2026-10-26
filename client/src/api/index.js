/*
We're going to use this directory to store all of our API calls.
Every time we need to talk to the backend, the server needs to call fetch("/api/...") to get the data.
But since this is cumbersome to do over and over again, instead, we'll create some easy-to-use functions in this file.
These functions will be called on the individual pages and handle all the fetching for us.
*/

function useRecipes() {
    const [recipes, setRecipes] = useState([]);
    useEffect(() => {
        // TODO: run the actual fetch() call: this is just a placeholder for now
        setTimeout(() => {
            setRecipes([])
        }, 50); // sample 50ms delay to simulate a fetch call
    })
}
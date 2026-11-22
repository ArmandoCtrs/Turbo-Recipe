import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express from "express";
import { ObjectId } from "mongodb";
import { favoritesRouter } from "./index.js";

const userId = new ObjectId();
const emptyUserId = new ObjectId();
const favoriteId = new ObjectId();
const users = new Map([
    [String(userId), { favorites: [favoriteId] }],
    [String(emptyUserId), {}],
]);
const userCollection = {
    async findOne({ _id }) {
        return users.get(String(_id)) ?? null;
    },
};

let server;
let baseUrl;
before(async () => {
    const app = express();
    app.use((req, res, next) => {
        req.session = req.headers["x-test-user"] ? { user: { id: req.headers["x-test-user"] } } : {};
        next();
    });
    app.use("/api/recipes", favoritesRouter(userCollection, {}));
    server = await new Promise((resolve) => {
        const listener = app.listen(0, "127.0.0.1", () => resolve(listener));
    });
    baseUrl = `http://127.0.0.1:${server.address().port}/api/recipes`;
});
after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

async function get(path, user) {
    const response = await fetch(`${baseUrl}${path}`, {
        headers: user ? { "x-test-user": String(user) } : {},
    });
    return { status: response.status, body: await response.json() };
}

test("lists the current user's favorite ObjectIds, including legacy users without favorites", async () => {
    assert.deepEqual(await get("/favorites", userId), {
        status: 200,
        body: { favorites: [String(favoriteId)] },
    });
    assert.deepEqual(await get("/favorites", emptyUserId), { status: 200, body: { favorites: [] } });
    assert.deepEqual(await get(`/${favoriteId}/favorite`, userId), { status: 200, body: { favorite: true } });
});

test("favorite lists require a valid authenticated user", async () => {
    assert.equal((await get("/favorites")).status, 401);
    assert.equal((await get("/favorites", "invalid")).status, 401);
    assert.equal((await get("/favorites", new ObjectId())).status, 404);
});

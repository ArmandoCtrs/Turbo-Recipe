export async function testDevApiConnection() {
    const res = await fetch("/api/ping");
    if (!res.ok) {
        return false;
    }

    return true;
}
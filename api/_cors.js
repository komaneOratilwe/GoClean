// Your old server.js used the "cors" package for this.
// Serverless functions don't have shared middleware, so every function
// calls this at the top instead. Returns true if the request was an
// OPTIONS preflight that's already been handled (so the function should stop).

function applyCors(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        res.status(200).end();
        return true;
    }

    return false;
}

module.exports = applyCors;

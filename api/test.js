const applyCors = require("./_cors");

module.exports = (req, res) => {
    if (applyCors(req, res)) return;

    res.status(200).json({
        message: "GoClean backend is working!"
    });
};

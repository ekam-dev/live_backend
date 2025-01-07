const { Router } = require("express");
const router = Router();

router.get("/list", function (req, res) {

    console.log(res)
    return res.status(200).json({
        status: 200,
        message: 'testing response'
    })
});


module.exports = router;
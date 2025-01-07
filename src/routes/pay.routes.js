const { Router } = require("express");

const router = Router();


router.get('/marchant',function(req,res){

	return res.status(200).json([{'num':Math.floor(Math.random() * 10000) }])
})


module.exports = router;
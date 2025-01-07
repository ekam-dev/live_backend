const { Router } = require("express");
const { getAllModifiers,addModifier,updateModifier,deleteModifier,getAllSetModifiers,SetNewModifiers,SetUpdateModifiers,SetStatusUpdateModifiers,DeleteSetModifiers,getMenuModifiers } = require("../controllers/modifiers.controller");
/*const { isLoggedIn, isAuthenticated, hasRefreshToken, authorize } = require("../middlewares/auth.middleware");*/

const router = Router();

router.get("/get-modifiers", getAllModifiers);

router.post("/add-modifiers", addModifier);
//update-modifiers
router.post("/:id/update-modifiers", updateModifier);

router.delete('/del-modifier/:id',deleteModifier)

router.get('/modifiers-set/get-all-setmodifiers/:id?',getAllSetModifiers)
//add-new-setmodifiers
router.post('/modifiers-set/add-new-setmodifiers',SetNewModifiers)
//modifiers-set/update-setmodifiers/
router.post('/modifiers-set/update-setmodifiers',SetUpdateModifiers)
///modifiers/modifiers-set/update-status-setmodidier
router.post('/modifiers-set/update-status-setmodidier',SetStatusUpdateModifiers)
//modifiers-set/delete-setmodidier
router.delete('/modifiers-set/delete-setmodidier/:id',DeleteSetModifiers)

router.get('/modifiers-set/get-menu-modifiers/:id',getMenuModifiers)
module.exports = router;
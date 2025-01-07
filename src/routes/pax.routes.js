const { Router } = require("express");
const {
  isLoggedIn,
  isAuthenticated,
  authorize,
  isSubscriptionActive,
} = require("../middlewares/auth.middleware");
const { SCOPES } = require("../config/user.config");
const { addPax , getAllPax,updatePax,deletePax,paxTerminal,tenantPax } = require("../controllers/pax.controller");

const router = Router();

router.post("/add-new-pax",isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.POS]),
  addPax);

router.get('/get-all-pax',getAllPax)
router.put('/update-pax',isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.POS]),updatePax)

router.delete('/delete-pax/:id',isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.POS]),deletePax)

router.get('/pax-terminal',paxTerminal)

router.get('/get-tenant-pax',isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.POS]),tenantPax)

module.exports = router;
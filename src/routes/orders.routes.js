const { Router } = require("express");

const {
  isLoggedIn,
  isAuthenticated,
  authorize,
  isSubscriptionActive,
} = require("../middlewares/auth.middleware");
const { SCOPES } = require("../config/user.config");
const {
  getOrders,
  getOrdersInit,
  updateKitchenOrderItemStatus,
  cancelKitchenOrder,
  completeKitchenOrder,
  getOrdersPaymentSummary,
  payAndCompleteKitchenOrder,
  getAllOrders,
  updateOrderStates,
  orderStats
} = require("../controllers/orders.controller");

const router = Router();

router.get(
  "/",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([
    SCOPES.POS,
    SCOPES.ORDERS,
    SCOPES.ORDER_STATUS,
    SCOPES.ORDER_STATUS_DISPLAY,
  ]),
  getOrders
);
router.get(
  "/init",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([
    SCOPES.POS,
    SCOPES.ORDERS,
    SCOPES.ORDER_STATUS,
    SCOPES.ORDER_STATUS_DISPLAY,
  ]),
  getOrdersInit
);

router.post(
  "/update-status/:id",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([
    SCOPES.POS,
    SCOPES.ORDERS,
    SCOPES.ORDER_STATUS,
    SCOPES.ORDER_STATUS_DISPLAY,
  ]),
  updateKitchenOrderItemStatus
);
router.post(
  "/cancel",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([
    SCOPES.POS,
    SCOPES.ORDERS,
    SCOPES.ORDER_STATUS,
    SCOPES.ORDER_STATUS_DISPLAY,
  ]),
  cancelKitchenOrder
);
router.post(
  "/complete",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([
    SCOPES.POS,
    SCOPES.ORDERS,
    SCOPES.ORDER_STATUS,
    SCOPES.ORDER_STATUS_DISPLAY,
  ]),
  completeKitchenOrder
);

router.post(
  "/complete-order-payment-summary",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([
    SCOPES.POS,
    SCOPES.ORDERS,
    SCOPES.ORDER_STATUS,
    SCOPES.ORDER_STATUS_DISPLAY,
  ]),
  getOrdersPaymentSummary
);
router.post(
  "/complete-and-pay-order",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([
    SCOPES.POS,
    SCOPES.ORDERS,
    SCOPES.ORDER_STATUS,
    SCOPES.ORDER_STATUS_DISPLAY,
  ]),
  payAndCompleteKitchenOrder
);

router.get(
  "/all-orders",
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([
    SCOPES.POS,
    SCOPES.ORDERS,
    SCOPES.ORDER_STATUS,
    SCOPES.ORDER_STATUS_DISPLAY,
  ]),
  getAllOrders
);

router.post('/order_status',
    isLoggedIn,
    isAuthenticated,
    isSubscriptionActive,
    authorize([
      SCOPES.POS,
      SCOPES.ORDERS,
      SCOPES.ORDER_STATUS,
      SCOPES.ORDER_STATUS_DISPLAY,
    ]),
    updateOrderStates
  )

router.get('/order_stats',
    isLoggedIn,
    isAuthenticated,
    isSubscriptionActive,
    authorize([
      SCOPES.POS,
      SCOPES.ORDERS,
      SCOPES.ORDER_STATUS,
      SCOPES.ORDER_STATUS_DISPLAY,
    ]),
    orderStats
  )


module.exports = router;

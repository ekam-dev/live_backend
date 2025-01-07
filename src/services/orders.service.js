const { getMySqlPromiseConnection } = require("../config/mysql.db")


exports.updateOrderStatesDB = async(req)=>{
    const conn = await getMySqlPromiseConnection();
    try{

        console.log(req.body.AccountInformation)
        const customerSql =  `INSERT INTO customers(name, tenant_id,card ) VALUES(?,?,?)`;
        const [response] = await conn.query(customerSql,[req.body.AccountInformation[7].trim(),req.user.tenant_id,req.body.AccountInformation[0] ]);
        return response;
    }catch(error){

      console.error(error);
     throw error;
      } finally {
      conn.release();
    }
}


exports.getAllOrdersDB = async(tenantId)=>{
  const conn = await getMySqlPromiseConnection();
     try{
         console.log(tenantId)
         sql = `SELECT orders.id,orders.delivery_type,orders.customer_type,orders.customer_id,orders.table_id,orders.status as order_status,orders.token_no,orders.payment_status as payment_status,orders.invoice_id,order_items.order_id as order_id,order_items.item_id as item_id,order_items.variant_id as variant_id,order_items.price as price,order_items.quantity as item_quantity,order_items.status as item_status,order_items.date item_order_date,order_items.date item_date,order_items.notes as item_notes,order_items.addons as item_addons,order_items.modifiers as item_modifiers FROM orders JOIN order_items ON order_items.order_id = orders.id LEFT JOIN store_tables ON store_tables.id = orders.table_id WHERE order_items.tenant_id = ? ORDER BY orders.id DESC`;
         const [allOrders] = await conn.query(sql,[tenantId]);
         return allOrders;


     }catch(error){

      console.error(error);
     throw error;
      } finally {
      conn.release();
    }
}

exports.getOrdersDB = async (tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

    const sql = `
    SELECT
      o.id,
      o.date,
      o.delivery_type,
      o.customer_type,
      o.customer_id,
      c. \`name\` AS customer_name,
      o.table_id,
      st.table_title,
      st. \`floor\`,
      o.status,
      o.payment_status,
      o.token_no
    FROM
      orders o
      LEFT JOIN customers c ON o.customer_id = c.phone AND c.tenant_id = o.tenant_id
      LEFT JOIN store_tables st ON o.table_id = st.id
    WHERE
      date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      AND date <= DATE_ADD(NOW(), INTERVAL 1 DAY)
      AND o.status NOT IN ('completed', 'cancelled')
      AND o.tenant_id = ?
    `;

    const [kitchenOrders] = await conn.query(sql, [tenantId]);

    let kitchenOrdersItems = [];
    let addons = [];

    if(kitchenOrders.length > 0) {
      const orderIds = kitchenOrders.map(o=>o.id).join(",");
      const sql2 = `
      SELECT
        oi.id,
        oi.order_id,
        oi.item_id,
        mi.title AS item_title,
        oi.variant_id,
        miv.title as variant_title,
        oi.price,
        oi.quantity,
        oi.status,
        oi.date,
        oi.addons,
        oi.modifiers,
        oi.notes
      FROM
        order_items oi
        LEFT JOIN menu_items mi ON oi.item_id = mi.id
        LEFT join menu_item_variants miv ON oi.item_id = miv.item_id AND oi.variant_id = miv.id
        
      WHERE oi.order_id IN (${orderIds})
      `
      const [kitchenOrdersItemsResult] = await conn.query(sql2);
      kitchenOrdersItems = kitchenOrdersItemsResult;

      const addonIds = [...new Set([...kitchenOrdersItems.flatMap((o)=>o.addons?JSON.parse(o?.addons):[])])].join(",");
      const [addonsResult] = addonIds ? await conn.query(`SELECT id, item_id, title FROM menu_item_addons WHERE id IN (${addonIds});`):[]
      addons = addonsResult;
    }
    return {
      kitchenOrders,
      kitchenOrdersItems,
      addons
    }
    
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    conn.release();
}
};

exports.updateOrderItemStatusDB = async (orderItemId, status, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

    const sql = `
    UPDATE order_items SET
    status = ?
    WHERE id = ? AND tenant_id = ?;
    `;

    await conn.query(sql, [status, orderItemId, tenantId]);
    
    return;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    conn.release();
}
};

exports.cancelOrderDB = async (orderIds, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

    const orderIdsText = orderIds.join(",");

    const sql = `
    UPDATE orders SET
    status = 'cancelled'
    WHERE id IN (${orderIdsText}) AND tenant_id = ?;
    `;
    await conn.query(sql, [tenantId]);


    const sqls = `
    UPDATE order_items SET
    status = 'cancelled'
    WHERE order_items.order_id IN (${orderIdsText}) AND tenant_id = ?;
    `;
    await conn.query(sqls, [tenantId]);

    return;
  } catch (error) {
    console.error(error);
    throw error;
  }
  finally {
    conn.release();
}
};

exports.completeOrderDB = async (orderIds, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

    const orderIdsText = orderIds.join(",");

    const sql = `
    UPDATE orders SET
    status = 'completed'
    WHERE id IN (${orderIdsText}) AND tenant_id = ?;
    `;

    await conn.query(sql, [tenantId]);
    
    return;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    conn.release();
}
};

exports.getOrdersPaymentSummaryDB = async (orderIdsToFindSummary, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

    const sql = `
    SELECT
      o.id,
      o.date,
      o.delivery_type,
      o.customer_type,
      o.customer_id,
      c. \`name\` AS customer_name,
      o.table_id,
      st.table_title,
      st. \`floor\`,
      o.status,
      o.payment_status,
      o.token_no
    FROM
      orders o
      LEFT JOIN customers c ON o.customer_id = c.phone AND c.tenant_id = o.tenant_id
      LEFT JOIN store_tables st ON o.table_id = st.id
    WHERE
      date >= DATE_SUB(NOW(), INTERVAL 1 DAY)
      AND date <= DATE_ADD(NOW(), INTERVAL 1 DAY)
      AND o.status NOT IN ('completed', 'cancelled')
      AND o.id IN (${orderIdsToFindSummary}) AND o.tenant_id = ?
    `;

    const [kitchenOrders] = await conn.query(sql, [tenantId]);

    let kitchenOrdersItems = [];
    let addons = [];

    if(kitchenOrders.length > 0) {
      const orderIds = kitchenOrders.map(o=>o.id).join(",");
      const sql2 = `
      SELECT
        oi.id,
        oi.order_id,
        oi.item_id,
        mi.title AS item_title,
        oi.variant_id,
        miv.title as variant_title,
        miv.price as variant_price,
        mi.price,
        mi.tax_id,
        t.title as tax_title,
        t.rate as tax_rate,
        t.type as tax_type,
        oi.quantity,
        oi.status,
        oi.date,
        oi.addons,
        oi.notes
      FROM
        order_items oi
        LEFT JOIN menu_items mi ON oi.item_id = mi.id
        LEFT JOIN menu_item_variants miv ON oi.item_id = miv.item_id AND oi.variant_id = miv.id
        LEFT JOIN taxes t ON mi.tax_id = t.id
        
      WHERE oi.order_id IN (${orderIds}) AND oi.status NOT IN ('cancelled')
      `
      const [kitchenOrdersItemsResult] = await conn.query(sql2);
      kitchenOrdersItems = kitchenOrdersItemsResult;

      const addonIds = [...new Set([...kitchenOrdersItems.flatMap((o)=>o.addons?JSON.parse(o?.addons):[])])].join(",");
      const [addonsResult] = addonIds ? await conn.query(`SELECT id, item_id, title, price FROM menu_item_addons WHERE id IN (${addonIds});`):[]
      addons = addonsResult;
    }


    return {
      kitchenOrders,
      kitchenOrdersItems,
      addons
    }
    
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    conn.release();
}
};

exports.createInvoiceDB = async (subtotal, taxTotal, total, date, selectedPaymentType, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {
    await conn.beginTransaction();

    let invoiceId = 0;

    const [invoiceSequence] = await conn.query("SELECT sequence_no FROM invoice_sequences WHERE tenant_id = ? LIMIT 1 FOR UPDATE", [tenantId]);
    invoiceId = invoiceSequence[0]?.sequence_no || 0;

    invoiceId += 1;

    const sql = `
    INSERT INTO invoices 
    (id, sub_total, tax_total, total, created_at, payment_type_id, tenant_id) 
    VALUES
    (?, ?, ?, ?, ?, ?, ?)
    `;

    await conn.query(sql, [invoiceId, subtotal, taxTotal, total, date, selectedPaymentType, tenantId]);

    await conn.query("INSERT INTO invoice_sequences ( sequence_no, tenant_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE sequence_no = VALUES(sequence_no);", [invoiceId, tenantId]);

    await conn.commit();

    return invoiceId;
  } catch (error) {
    console.error(error);
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

exports.completeOrdersAndSaveInvoiceIdDB = async (orderIds, invoiceId, tenantId) => {
  const conn = await getMySqlPromiseConnection();
  try {

    const orderIdsText = orderIds.join(",");

    const sql = `
    UPDATE orders SET
    status = 'completed', payment_status = 'paid', invoice_id = ?
    WHERE id IN (${orderIdsText}) AND tenant_id = ?;
    `;

    await conn.query(sql, [invoiceId, tenantId]);
    
    return;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    conn.release();
  }
}


exports.orderStatsDB = async(tenantId)=>{
  const conn = await getMySqlPromiseConnection();
  try{


    const sql = `SELECT IFNULL(statuses.status, 'total') AS status, COUNT(order_items.status) AS status_count FROM (SELECT 'created' AS status UNION ALL SELECT 'preparing' UNION ALL SELECT 'completed' UNION ALL SELECT 'cancelled' UNION ALL SELECT 'delivered') AS statuses LEFT JOIN order_items ON order_items.status = statuses.status AND order_items.tenant_id = ? GROUP BY statuses.status WITH ROLLUP`;

    const [result] = await conn.query(sql,[tenantId]);

    return result;

  }catch (error) {
    console.error(error);
    throw error;
  } finally {
    conn.release();
  }

}
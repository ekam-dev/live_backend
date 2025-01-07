const { getMySqlPromiseConnection } = require("../config/mysql.db")

exports.addMenuItemDB = async (title, price, netPrice, taxId, categoryId, tenantId,list) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        INSERT INTO menu_items
        (title, price, net_price, tax_id, category, tenant_id)
        VALUES
        (?, ?, ?, ?, ?, ?);
        `;

        const sqlModifirstSet = `
        INSERT INTO menu_modifierset
        (modifierset_id, menu_id)
        VALUES
        (?, ?);
        `;

        const [result] = await conn.query(sql, [title, price, netPrice, taxId, categoryId, tenantId]);
        list.map(async (entity,index)=>{
            await conn.query(sqlModifirstSet, [entity.value,result.insertId]);
        })

        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.updateMenuItemDB = async (id, title, price, netPrice, taxId, categoryId, tenantId,list) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE menu_items SET
        title = ?, price = ?, net_price = ?, tax_id = ?, category = ?
        WHERE id = ? AND tenant_id = ?;
        `;
        const checkSql = `SELECT * FROM menu_modifierset WHERE menu_id = ?`;
        const sqlsetModifier = `
        UPDATE menu_modifierset
        SET modifierset_id = ?   
        WHERE id = ?
        `;
        const sqlNewModifier = `
        INSERT INTO menu_modifierset(modifierset_id,menu_id)
        VALUES(?,?)
        `;
        const sqlsetModifierDelete = `
        DELETE FROM menu_modifierset   
        WHERE id = ?
        `; 
        const [check] = await conn.query(checkSql, [id]);
        
        const itemid  = list.map((entity,index)=>{return parseInt(entity.modifierid)})
        const isValid = check.map((entity,index)=>{return parseInt(entity.id)})
        
        await conn.query(sql, [title, price, netPrice, taxId, categoryId, id, tenantId]);
        
        list.map(async (entity,index)=>{
            if(entity.modifierid==undefined){
                    await conn.query(sqlNewModifier, [entity.value,id])
            }
            if(isValid.includes(parseInt(entity.modifierid))){
                await conn.query(sqlsetModifier, [entity.value,entity.modifierid])
            }
        })
        const removeItems = isValid.filter(function(obj) { return itemid.indexOf(obj) == -1; });
        const newItems = isValid.filter(function(obj) { return isValid.indexOf(obj) == -1; });
        removeItems.map(async (rd,key)=>{
                    await conn.query(sqlsetModifierDelete, [rd])
        })
        
        
        
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.updateMenuItemImageDB = async (id, image, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE menu_items SET
        image = ?
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [image, id, tenantId]);

        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.deleteMenuItemDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM menu_items 
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [id, tenantId]);
        
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getAllMenuItemsDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT 
        i.id, i.title, price, net_price, tax_id, t.title AS tax_title, t.rate AS tax_rate, t.type AS tax_type, category as category_id, c.title AS category_title,c.color_code as color_code, image,GROUP_CONCAT(m.modifierset_id ORDER BY m.id) as modifier_setid, GROUP_CONCAT(mm.title) as modifier_title,GROUP_CONCAT(mm.is_required ORDER BY mm.id) as isrequired,GROUP_CONCAT(mm.multi_select ORDER BY mm.id) as is_multiselect
        FROM menu_items i
        LEFT JOIN taxes t
        ON i.tax_id = t.id
        LEFT JOIN categories c
        ON i.category = c.id
        LEFT JOIN menu_modifierset m ON 
        m.menu_id = i.id
        LEFT JOIN modifiersets mm ON
        mm.id = m.modifierset_id
        WHERE i.tenant_id = ?
        GROUP BY i.id
        `;

        const [result] = await conn.query(sql, [tenantId]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.getMenuItemDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT 
        i.id, i.title, price, net_price, tax_id, t.title AS tax_title, t.rate AS tax_rate, t.type AS tax_type, category as category_id, c.title AS category_title, image, image,GROUP_CONCAT(m.modifierset_id) as modifier_setid, GROUP_CONCAT(mm.title) as modifier_title,GROUP_CONCAT(m.id) as modifierid,GROUP_CONCAT(mm.is_required) as isrequired,GROUP_CONCAT(mm.multi_select) as is_multiselect
        FROM menu_items i
        LEFT JOIN taxes t
        ON i.tax_id = t.id
        LEFT JOIN categories c
        ON i.category = c.id
        LEFT JOIN menu_modifierset m ON 
        m.menu_id = i.id
        LEFT JOIN modifiersets mm ON
        mm.id = m.modifierset_id
        WHERE i.id = ? AND i.tenant_id = ?
        GROUP BY i.id
        `;

        const [result] = await conn.query(sql, [id, tenantId]);
        return result[0];
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

/**
 * @param {number} itemId Menu Item ID to add Addon
 * @param {string} title Title of Addon
 * @param {number} price Additonal Price for addon, Put 0 / null to make addon as free option
 * @returns {Promise<number>}
 *  */ 
exports.addMenuItemAddonDB = async (itemId, title, price, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        INSERT INTO menu_item_addons
        (item_id, title, price, tenant_id)
        VALUES
        (?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [itemId, title, price, tenantId]);
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * @param {number} itemId Menu Item ID 
 * @param {number} addonId Addon ID 
 * @param {string} title Title of Addon
 * @param {number} price Additonal Price for addon, Put 0 / null to make addon as free option
 * @returns {Promise<void>}
 *  */ 
exports.updateMenuItemAddonDB = async (itemId, addonId, title, price, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE menu_item_addons
        SET
        title = ?, price = ?
        WHERE id = ? AND item_id = ? AND tenant_id = ?
        `;

        await conn.query(sql, [title, price, addonId, itemId, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * @param {number} itemId Menu Item ID 
 * @param {number} addonId Addon ID 
 * @returns {Promise<void>}
 *  */ 
exports.deleteMenuItemAddonDB = async (itemId, addonId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM menu_item_addons
        WHERE id = ? AND item_id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [addonId, itemId, tenantId]);
        
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * @param {number} itemId Menu Item ID 
 * @param {number} addonId Addon ID 
 * @returns {Promise<Array>}
 *  */ 
exports.getMenuItemAddonsDB = async (itemId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT id, item_id, title, price FROM menu_item_addons
        WHERE item_id = ? AND tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [itemId, tenantId]);
        
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getAllAddonsDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT id, item_id, title, price FROM menu_item_addons
        WHERE tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [tenantId]);
        
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

/**
 * @param {number} itemId Menu Item ID to add Variant
 * @param {string} title Title of Variant
 * @param {number} price Additonal Price for Variant, Put 0 / null to make Variant as free option
 * @returns {Promise<number>}
 *  */ 
exports.addMenuItemVariantDB = async (itemId, title, price, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        INSERT INTO menu_item_variants
        (item_id, title, price, tenant_id)
        VALUES
        (?, ?, ?, ?);
        `;

        const [result] = await conn.query(sql, [itemId, title, price, tenantId]);
        
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.updateMenuItemVariantDB = async (itemId, variantId, title, price, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        UPDATE menu_item_variants
        SET
        title = ?, price = ?
        WHERE item_id = ? AND id = ? AND tenant_id = ?
        `;

        await conn.query(sql, [title, price, itemId, variantId, tenantId]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.deleteMenuItemVariantDB = async (itemId, variantId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        DELETE FROM menu_item_variants
        WHERE item_id = ? AND id = ? AND tenant_id = ?
        `;

        await conn.query(sql, [itemId, variantId, tenantId]);
        
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};

exports.getMenuItemVariantsDB = async (itemId, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT id, item_id, title, price FROM menu_item_variants
        WHERE item_id = ? AND tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [itemId, tenantId]);
        
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};
exports.getAllVariantsDB = async (tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT id, item_id, title, price FROM menu_item_variants
        WHERE tenant_id = ?;
        `;

        const [result] = await conn.query(sql, [tenantId]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};
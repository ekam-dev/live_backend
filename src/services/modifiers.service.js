const { getMySqlPromiseConnection } = require("../config/mysql.db")


exports.addModifersDB = async (title,price,status)=>{
    const { default: slug } = await import('slug');
	const conn = await getMySqlPromiseConnection();
	const setSlug = slug(title);
    
	try {
        const sql = `
        INSERT INTO modifiers
        (title, price,slug)
        VALUES (?, ?,?);
        `;

        const [result] = await conn.query(sql, [title, price,setSlug,status]);
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}


exports.getModifiersDB = async (id, tenantId) => {
    const conn = await getMySqlPromiseConnection();
    try {

        const sql = `
        SELECT * from modifiers
        `;

        const [result] = await conn.query(sql);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}



exports.updateModifierDB = async (id, title, price = null,status) => {
    const conn = await getMySqlPromiseConnection();
    const { default: slug } = await import('slug');
    const newslug = slug(title)
    try {
        const sql = `
        UPDATE modifiers
        SET title = ?,
        price = ?,
        slug  = ?,
        status = ? 
        WHERE id = ?;
        `;

        await conn.query(sql, [title,price,newslug, status, id]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};


exports.deleteModifierDB = async (id) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        DELETE FROM modifiers
        WHERE id = ?;
        `;

        await conn.query(sql, [id]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};


exports.setNewModifersDB = async(title,isrequired,multi,list,min,max)=>{
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        INSERT INTO modifiersets
        (title, is_required,multi_select,min_select,max_select)
        VALUES (?, ?,?,?,?);
        `;
        
        const [result]= await conn.query(sql, [title, isrequired,multi,min,max]);
        const sqlsetModifier = `
        INSERT INTO modifiersets_items
        (modifier_id, modifierset_id,sort_order)
        VALUES (?, ?,?);
        `;
        list.map(async (entity,index)=>{
            await conn.query(sqlsetModifier, [entity.value,result.insertId,entity.sorting]);
        })
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}


exports.getSetModifiersDB = async (id) => {
    const conn = await getMySqlPromiseConnection();
    const condition = id ? 'WHERE modifiersets.id='+id : '';
    try {
        const sql = `SELECT modifiersets.*, 
               GROUP_CONCAT(modifiers.title ORDER BY sort_order) as modifier_items,
               GROUP_CONCAT(modifiersets_items.modifier_id ORDER BY sort_order) as modifier_ids,
               GROUP_CONCAT(modifiersets_items.id ORDER BY sort_order) as modifier_itemid
        FROM modifiersets_items
        JOIN modifiers ON modifiers.id = modifiersets_items.modifier_id
        RIGHT JOIN modifiersets ON modifiersets.id = modifiersets_items.modifierset_id  
        ${condition}
        GROUP BY modifiersets.id  -- Group by the modifiersets.id instead of modifiersets_items.modifierset_id
        ORDER BY modifiersets.created_date DESC`;

        const [result] = await conn.query(sql);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.deleteSetModifierDB = async (id) => {
    const conn = await getMySqlPromiseConnection();

    try {
        const sql = `
        DELETE FROM modifiersets
        WHERE id = ?;
        `;

        await conn.query(sql, [id]);
        return;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
};


exports.setUpdateModifersDB = async(id,title,isrequired,multi,selected,min,max)=>{
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        UPDATE modifiersets
        SET title = ?,
        is_required = ?,
        multi_select = ?,
        min_select = ?,
        max_select = ? 
        WHERE id = ?
        `;
        
        const [result]= await conn.query(sql, [title, isrequired,multi,min,max,id]);

        const checkSql = `SELECT * FROM modifiersets_items WHERE modifierset_id = ?`;
        const [check] = await conn.query(checkSql, [id]);
        const sqlsetModifier = `
        UPDATE modifiersets_items
        SET modifier_id = ?,sort_order = ? 
        WHERE id = ?
        `;
        const sqlNewModifier = `
        INSERT INTO modifiersets_items(modifier_id,modifierset_id,sort_order)
        VALUES(?,?,?)
        `;
        const sqlsetModifierDelete = `
        DELETE FROM modifiersets_items   
        WHERE id = ?
        `; 
        const itemid  = selected.map((entity,index)=>{return parseInt(entity.itemid)})
        const isValid = check.map((entity,index)=>{return parseInt(entity.id)})
        
        selected.map(async (entity,index)=>{
            if(entity.itemid==undefined){
                    await conn.query(sqlNewModifier, [entity.value,id,entity.sorting])
            }
            if(isValid.includes(parseInt(entity.itemid))){
                await conn.query(sqlsetModifier, [entity.value,entity.sorting,entity.itemid])
            }
        })
        const removeItems = isValid.filter(function(obj) { return itemid.indexOf(obj) == -1; });
        const newItems = isValid.filter(function(obj) { return isValid.indexOf(obj) == -1; });
        removeItems.map(async (rd,key)=>{
                    await conn.query(sqlsetModifierDelete, [rd])
        })
        
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}

exports.setStatusUpdateModifersDB = async(id,status)=>{

    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        UPDATE modifiersets
        SET status = ? 
        WHERE id = ?
        `;
        const [result]= await conn.query(sql, [status,id]);
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }

}


exports.setDeleteModifersDB = async(id)=>{
   
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `DELETE FROM modifiersets WHERE id = ?`;
        const sqlsetList = `
        DELETE FROM modifiersets_items
        WHERE modifierset_id = ?;
        `;
        const [result]= await conn.query(sql, [id]);
        await conn.query(sqlsetList, [id]);
        return result.insertId;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}


exports.getMenuModifiersDB = async(id)=>{
    const conn = await getMySqlPromiseConnection();
    try {
        const sql = `
        SELECT 
            mn.id,
            mn.menu_id, 
            mm.title AS modifier_name,
            GROUP_CONCAT(m.title) AS modifier_items,
            GROUP_CONCAT(m.id) AS modifier_items_id,
            mm.is_required,
            mm.multi_select,
            mm.min_select AS min_allow,
            mm.max_select AS max_allow,
            GROUP_CONCAT(m.price) AS price,
            mi.modifierset_id
        FROM menu_modifierset mn
        JOIN modifiersets mm ON mm.id = mn.modifierset_id
        JOIN modifiersets_items mi ON mi.modifierset_id = mn.modifierset_id
        JOIN modifiers m ON m.id = mi.modifier_id
        WHERE menu_id = ?
        GROUP BY mn.modifierset_id, mn.id
        `;

        const [result] = await conn.query(sql, [id]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    } finally {
        conn.release();
    }
}
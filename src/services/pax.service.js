const { getMySqlPromiseConnection } = require("../config/mysql.db")


exports.addNewPax = async(serialno,ip,port,status,id)=>{
	const conn = await getMySqlPromiseConnection();
	try{
		const sql = `INSERT INTO pax_settings(serial_no,service_ip,service_port,status,tenant_id) VALUE(?,?,?,?,?)`;
		const [result] = await conn.query(sql, [serialno, ip,port,status,id]);
        return result.insertId;

	}catch(error){
		console.error(error);
        throw error;
	}finally{
		conn.release();
	}
}

exports.getTenantPax = async(id)=>{
	const conn = await getMySqlPromiseConnection();
        try{
        	const sql = `SELECT * FROM pax_settings WHERE status = 1 && tenant_id = ?`;

        	const result = await conn.query(sql,[id])
        	return result;

        }catch(error){
        		console.log(error)
        		throw error;
        }finally{
        	conn.release();
        }
}

exports.getPax = async()=>{
        const conn = await getMySqlPromiseConnection();
        try{
        	const sql = `SELECT * FROM pax_settings`;

        	const [result] = await conn.query(sql)
        	return result;

        }catch(error){
        		console.log(error)
        		throw error;
        }finally{
        	conn.release();
        }
}

exports.updatePaxDB = async(id,serialno, ip,port,status,tenant)=>{
	const conn = await getMySqlPromiseConnection();
	try{
		const sql = `
			UPDATE pax_settings SET 
			serial_no = ?,
			service_ip = ?,
			service_port=?,
			status = ?,
			tenant_id = ? 
			WHERE id = ?
		`;
		const [result] = await conn.query(sql, [serialno, ip,port,status,tenant,parseInt(id)]);
        return result.insertId;

	}catch(error){
		console.error(error);
        throw error;
	}finally{
		conn.release();
	}
}

exports.deletePaxDB = async(id, tenantId)=>{
	const conn = await getMySqlPromiseConnection();
	try{

		const sql = `
        DELETE FROM pax_settings 
        WHERE id = ? AND tenant_id = ?;
        `;

        await conn.query(sql, [id, tenantId]);
        
        return;
	}
	catch(error){
		console.error(error);
        throw error;
	}finally{
		conn.release();
	}
}
const { CONFIG } = require("../config");

const { addNewPax,getPax,updatePaxDB,deletePaxDB,getTenantPax } = require("../services/pax.service");


exports.tenantPax = async(req,res)=>{
     try{

          const [result] = await Promise.all([getTenantPax(req.user.tenant_id)]);

          return res.status(200).json(result)

     }catch(error){
          console.error(error);
            return res.status(500).json({
             success: false,
             message: "Something went wrong! Please try later!"
            });
     }
}

exports.addPax = async (req,res)=>{
       
       try{

       	const serialNo = req.body.serialNo;
       	const ip = req.body.ipaddress;
       	const port = req.body.port;
       	const status = req.body.status;
       	const result = await addNewPax(serialNo,ip,port,status,req.user.tenant_id)
       	
       	return res.status(200).json({
            success: true,
            message: `New Pax Added Successfully.`,
            
        });

       }catch(error){

       	    console.error(error);
            return res.status(500).json({
             success: false,
             message: "Something went wrong! Please try later!"
            });
       }
}


exports.getAllPax = async(req,res)=>{

	try{

		const [result] = await Promise.all([getPax()]);

		return res.status(200).json(result)

	}catch(error){
		console.error(error);
            return res.status(500).json({
             success: false,
             message: "Something went wrong! Please try later!"
            });
	}
}

exports.updatePax = async(req,res)=>{

        try{

        const id = req.body.id;
       	const serialNo = req.body.serialNo;
       	const ip = req.body.ipaddress;
       	const port = req.body.port;
       	const status = req.body.status;
       	const result = await updatePaxDB(id,serialNo,ip,port,status,req.user.tenant_id)
       	
       	return res.status(200).json({
            success: true,
            message: `Updated Successfully.`,
            
        });
       }catch(error){

       	    console.error(error);
            return res.status(500).json({
             success: false,
             message: "Something went wrong! Please try later!"
            });
       }
}

exports.deletePax = async (req,res)=>{

		try{
			await deletePaxDB(req.params.id,req.user.tenant_id);
			return res.status(200).json({
            	success: true,
            	message: "Pax Deleted."
        	});

		}catch(error){
			console.error(error);
            return res.status(500).json({
             success: false,
             message: "Something went wrong! Please try later!"
            });
		}
}

exports.paxTerminal = async(req,res)=>{

     try{

          return res.status(200).json({
               success:true,
               message : 'Pax terminal'
          });

     }catch(error){
          console.error(error);
            return res.status(500).json({
             success: false,
             message: "Something went wrong! Please try later!"
            });
     }
}
const { CONFIG } = require("../config");
const { getModifiersDB , addModifersDB,updateModifierDB,deleteModifierDB,setNewModifersDB,getSetModifiersDB,setUpdateModifersDB,setStatusUpdateModifersDB,setDeleteModifersDB,getMenuModifiersDB} = require("../services/modifiers.service");


exports.addModifier = async (req, res) => {
    try {

        const title = req.body.title;
        const price = req.body.price > 0 ? req.body.price : 0.0;
        const status = req.body.status;
        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: "Please provide required details!"
            });
        }

        /*if(!(color_code)) {
            return res.status(400).json({
                success: false,
                message: "Please provide required details!"
            });
        }
		*/
        const id = await addModifersDB(title, price,status);
        return res.status(200).json({
            success: true,
            message: `Modifier Added.`,
            
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
};

exports.getMenuModifiers = async (req,res)=>{
    try{
        const [modifiersList] = await Promise.all([
            getMenuModifiersDB(req.params.id)
        ]);
        return res.status(200).json(modifiersList);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
}


exports.getAllModifiers = async (req, res) => {
    try {
      
        const [modifiersList] = await Promise.all([
            getModifiersDB()
        ]);

        return res.status(200).json(modifiersList);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
};


exports.getAllSetModifiers = async (req, res) => {

    const id = req.params.id && (req.params.id !== 'undefined') ? req.params.id : null
    try {
      
        const [modifiersList] = await Promise.all([
            getSetModifiersDB(id)
        ]);

        return res.status(200).json(modifiersList);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
};



exports.updateModifier = async (req, res) => {
    try {
        const title = req.body.title;
        const price = req.body.price;
        const status = req.body.status;
        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: "Please provide required details!"
            });
        }

        /*if(!(color_code)) {
            return res.status(400).json({
                success: false,
                message: "Please provide required details!"
            });
        }
        */
        await updateModifierDB(req.params.id,title, price,status);
        return res.status(200).json({
            success: true,
            message: `Modifier Updated.`,
            
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
};


exports.deleteModifier = async(req,res)=>{
    try {
        const id = req.params.id;

        await deleteModifierDB(id);
        return res.status(200).json({
            success: true,
            message: `Modifier Deleted.`,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
}

exports.SetNewModifiers = async(req,res)=>{
    try {
        const title = req.body.title;
        const required = req.body.required_value
        const multi = req.body.multi
        const list =  req.body.list;
        const min =  req.body.min;
        const max =  req.body.max;

        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: "Please provide required details!"
            });
        }
        const id = await setNewModifersDB(title, required,multi,list,min,max);
        return res.status(200).json({
            success: true,
            message: `Modifier Set Added.`,
            
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
}

exports.SetUpdateModifiers = async(req,res)=>{
try {
        const id = req.body.id
        const title = req.body.title;
        const required = req.body.required_value
        const multi = req.body.multi
        const selected = req.body.selected
        const min = req.body.min
        const max = req.body.max
        if(!(title)) {
            return res.status(400).json({
                success: false,
                message: "Please provide required details!"
            });
        }
        setUpdateModifersDB(id,title,required,multi,selected,min,max);
        return res.status(200).json({
            success: true,
            message: `Modifier Set Updated.`,
            
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
}


exports.SetStatusUpdateModifiers = async(req,res)=>{
try {
        const id = req.body.id
        const status = req.body.status;
       
        setStatusUpdateModifersDB(id,status);
        return res.status(200).json({
            success: true,
            message: `Modifier Set Status Updated.`,
            
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
}


exports.DeleteSetModifiers = async(req,res)=>{
    try {
        const id = req.params.id
        setDeleteModifersDB(id);
        return res.status(200).json({
            success: true,
            message: `Modifier Set Deleted.`,
            
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong! Please try later!"
        });
    }
}
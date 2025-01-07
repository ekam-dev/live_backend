const app = require("./src/app");

const { createServer } = require("https");
const { Server } = require("socket.io");
const { CONFIG } = require("./src/config");
const { getTenantIdFromQRCode } = require("./src/services/settings.service");
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

var SSloptions = {
  key: fs.readFileSync(path.join('/etc/letsencrypt/live/rxpos.in/privkey.pem')),
  cert: fs.readFileSync(path.join('/etc/letsencrypt/live/rxpos.in/fullchain.pem')),
};

const io = new Server(httpServer, { 
    cors: {
        credentials: true,
        origin: CONFIG.FRONTEND_DOMAIN,
        methods: ["GET", "POST"],
    },
    SSloptions
});

io.on("connection", (socket)=>{
    console.log(socket.id);

    socket.on('authenticate', async (tenantId) => {
        socket.join(tenantId); // Join the room for the restaurant
    });

    socket.on("new_order_backend", (payload, tenantId)=>{
        // socket.broadcast.emit("new_order", payload);
        socket.to(tenantId).emit("new_order", payload);
    })

    socket.on("new_qrorder_backend", async (payload, qrcode)=>{

        try {
            const tenantId = await getTenantIdFromQRCode(qrcode);
            socket.to(tenantId).emit("new_qrorder", payload);
        } catch (error) {
            console.log(error);
        }
    })

    socket.on("order_update_backend", (payload, tenantId)=>{
        console.log(payload);
        // socket.broadcast.emit("order_update", payload);
        socket.to(tenantId).emit("order_update", payload);
    })
});

httpServer.listen(PORT);

// app.listen(PORT, ()=>{
//     console.log(`Server Started on PORT: ${PORT}`);
// });
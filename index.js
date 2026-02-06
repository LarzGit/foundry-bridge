const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.write(`<h1>🟢 BRIDGE ONLINE</h1>`);
        res.end();
    } else {
        res.writeHead(404);
        res.end();
    }
});

const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

io.on("connection", (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    // --- СИНХРОНІЗАЦІЯ ДАНИХ ---
    socket.on("request_sheet_data", (id) => io.emit("request_sheet_data", id));
    socket.on("receive_sheet_data", (data) => io.emit("receive_sheet_data", data));

    // --- 🔥 НОВЕ: ВИБІР ПЕРСОНАЖА ---
    // Телефон просить список доступних героїв
    socket.on("request_actor_list", () => io.emit("request_actor_list"));
    // Foundry відправляє цей список
    socket.on("receive_actor_list", (list) => io.emit("receive_actor_list", list));

    // --- КИДКИ ---
    socket.on("mobile_roll_skill", (data) => io.emit("mobile_roll_skill", data));
    socket.on("mobile_roll_ability", (data) => io.emit("mobile_roll_ability", data));
    socket.on("mobile_roll_save", (data) => io.emit("mobile_roll_save", data));
    socket.on("mobile_use_item", (data) => io.emit("mobile_use_item", data));
    socket.on("mobile_roll_damage", (data) => io.emit("mobile_roll_damage", data));

    // --- ЧАТ ---
    socket.on("foundry_chat_message", (data) => io.emit("phone_chat_message", data));
    socket.on("mobile_chat_message", (data) => io.emit("mobile_chat_message", data));
});

httpServer.listen(PORT, () => console.log(`🚀 Bridge running on port ${PORT}`));
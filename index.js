const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.write(`<h1>🟢 SERVER ONLINE</h1>`);
        res.end();
    } else {
        res.writeHead(404);
        res.end();
    }
});

const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

console.log(`🌉 BRIDGE | Запуск на порту ${PORT}`);

io.on("connection", (socket) => {
    console.log(`🔌 Клієнт підключився: ${socket.id}`);

    // --- ЛИСТ ПЕРСОНАЖА ---
    socket.on("request_sheet_data", (id) => io.emit("request_sheet_data", id));
    socket.on("receive_sheet_data", (data) => io.emit("receive_sheet_data", data));

    // --- КИДКИ З ТЕЛЕФОНУ ---
    socket.on("mobile_roll_skill", (data) => io.emit("mobile_roll_skill", data));
    socket.on("mobile_roll_ability", (data) => io.emit("mobile_roll_ability", data));

    // 🔥 ОСЬ ЦЬОГО РЯДКА НЕ ВИСТАЧАЛО! ДОДАЙ ЙОГО:
    socket.on("mobile_roll_save", (data) => io.emit("mobile_roll_save", data));

    socket.on("mobile_use_item", (data) => io.emit("mobile_use_item", data));
    socket.on("mobile_roll_damage", (data) => io.emit("mobile_roll_damage", data));

    // --- 🆕 ЧАТ (FOUNDRY -> PHONE) ---
    socket.on("foundry_chat_message", (data) => io.emit("phone_chat_message", data));

});

httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
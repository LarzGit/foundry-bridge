const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

// Веб-сервер
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

// Socket.IO
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
});

console.log(`🌉 BRIDGE | Запуск на порту ${PORT}`);

// === ГОЛОВНА ЛОГІКА ===
io.on("connection", (socket) => {
    console.log(`🔌 Клієнт підключився: ${socket.id}`);

    // 1. Лист персонажа
    socket.on("request_sheet_data", (id) => io.emit("request_sheet_data", id));
    socket.on("receive_sheet_data", (data) => io.emit("receive_sheet_data", data));

    // 2. Кидки
    socket.on("mobile_roll_skill", (data) => io.emit("mobile_roll_skill", data));
    socket.on("mobile_roll_ability", (data) => io.emit("mobile_roll_ability", data));

    // 3. Предмети
    socket.on("mobile_use_item", (data) => io.emit("mobile_use_item", data));

    // 4. ШКОДА (Обов'язково має бути тут!)
    socket.on("mobile_roll_damage", (data) => io.emit("mobile_roll_damage", data));

}); // <--- ФУНКЦІЯ ЗАКРИВАЄТЬСЯ ТУТ. ВАЖЛИВО!

httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
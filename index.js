const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.write(`<h1>🟢 BRIDGE ONLINE (Map Support)</h1>`);
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

    // --- СИНХРОНІЗАЦІЯ ЛИСТА ПЕРСОНАЖА ---
    socket.on("request_sheet_data", (id) => io.emit("request_sheet_data", id));
    socket.on("receive_sheet_data", (data) => io.emit("receive_sheet_data", data));

    // --- ВИБІР ПЕРСОНАЖА ---
    socket.on("request_actor_list", () => io.emit("request_actor_list"));
    socket.on("receive_actor_list", (list) => io.emit("receive_actor_list", list));

    // --- БЕЗПЕКА (PIN-КОД) ---
    socket.on("mobile_login_attempt", (data) => io.emit("mobile_login_attempt", data));
    socket.on("login_success", () => io.emit("login_success"));
    socket.on("login_failed", () => io.emit("login_failed"));

    // --- 🔥 МАПА ТА ТОКЕНИ (НОВЕ) ---
    // Foundry відправляє дані мапи (картинка, розміри)
    socket.on("send_map_data", (data) => io.emit("receive_map_data", data));
    // Foundry відправляє позиції всіх токенів
    socket.on("send_tokens", (data) => io.emit("receive_tokens", data));
    // Телефон просить пересунути токен
    socket.on("mobile_move_token", (data) => io.emit("mobile_move_token", data));

    // --- КИДКИ ---
    socket.on("mobile_roll_skill", (data) => io.emit("mobile_roll_skill", data));
    socket.on("mobile_roll_ability", (data) => io.emit("mobile_roll_ability", data));
    socket.on("mobile_roll_save", (data) => io.emit("mobile_roll_save", data));
    socket.on("mobile_use_item", (data) => io.emit("mobile_use_item", data));
    socket.on("mobile_roll_damage", (data) => io.emit("mobile_roll_damage", data));

    // --- ЧАТ ---
    socket.on("foundry_chat_message", (data) => io.emit("phone_chat_message", data));
    socket.on("mobile_chat_message", (data) => io.emit("mobile_chat_message", data));

    socket.on("disconnect", () => console.log(`❌ Disconnected: ${socket.id}`));
});

httpServer.listen(PORT, () => console.log(`🚀 Bridge running on port ${PORT}`));
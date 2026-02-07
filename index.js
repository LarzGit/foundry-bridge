const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.write(`<h1>🟢 BRIDGE ONLINE (Stable + Rooms)</h1>`);
        res.end();
    } else {
        res.writeHead(404);
        res.end();
    }
});

// 🔥 ВАЖЛИВО: Збільшуємо ліміт буфера до 10МБ, щоб великі мапи не рвали з'єднання
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
    maxHttpBufferSize: 1e7
});

io.on("connection", (socket) => {
    console.log(`🔌 Connected: ${socket.id}`);

    // --- 1. АВТОРИЗАЦІЯ ТА КІМНАТИ ---
    socket.on("mobile_login_attempt", (data) => {
        // Телефон заходить у свою приватну кімнату
        const roomName = `actor_${data.actorId}`;
        socket.join(roomName);
        console.log(`📱 Socket ${socket.id} joined room: ${roomName}`);

        // Повідомляємо Foundry (всім), що хтось стукає
        io.emit("mobile_login_attempt", data);
    });

    socket.on("login_success", () => io.emit("login_success"));
    socket.on("login_failed", () => io.emit("login_failed"));

    // --- 2. ВИБІР ПЕРСОНАЖА ---
    socket.on("request_actor_list", () => io.emit("request_actor_list"));
    socket.on("receive_actor_list", (list) => io.emit("receive_actor_list", list));

    // --- 3. ДАНІ ПЕРСОНАЖА (ІЗОЛЬОВАНІ) ---
    socket.on("request_sheet_data", (id) => io.emit("request_sheet_data", id));

    socket.on("receive_sheet_data", (data) => {
        if (data && data.id) {
            // 🔥 Шлемо тільки в кімнату конкретного персонажа
            io.to(`actor_${data.id}`).emit("receive_sheet_data", data);
        }
    });

    // --- 4. МАПА ТА ТОКЕНИ (ОПТИМІЗАЦІЯ) ---
    // Використовуємо socket.broadcast.emit замість io.emit
    // Це означає: "Відправити всім КРІМ того, хто надіслав (Foundry)"
    // Це запобігає петлям даних, які кладуть сервер.

    socket.on("send_map_data", (data) => {
        socket.broadcast.emit("receive_map_data", data);
    });

    socket.on("send_tokens", (data) => {
        socket.broadcast.emit("receive_tokens", data);
    });

    // Рух від телефону до Foundry
    socket.on("mobile_move_token", (data) => io.emit("mobile_move_token", data));

    // --- 5. КИДКИ ТА ДІЇ (Телефон -> Foundry) ---
    const relayEvents = [
        "mobile_roll_skill", "mobile_roll_ability", "mobile_roll_save",
        "mobile_use_item", "mobile_roll_damage", "mobile_chat_message"
    ];

    relayEvents.forEach(event => {
        socket.on(event, (data) => io.emit(event, data));
    });

    // --- 6. ЧАТ (Foundry -> Телефон) ---
    socket.on("foundry_chat_message", (data) => io.emit("phone_chat_message", data));

    socket.on("disconnect", () => console.log(`❌ Disconnected: ${socket.id}`));
});

httpServer.listen(PORT, () => console.log(`🚀 Bridge running on port ${PORT}`));
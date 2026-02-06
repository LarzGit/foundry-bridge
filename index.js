const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer((req, res) => {
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.write(`<h1>🟢 BRIDGE ONLINE (Rooms Enabled)</h1>`);
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

    // --- 1. ВИБІР ПЕРСОНАЖА (Загальний канал) ---
    // Список героїв бачать усі, хто на екрані вибору
    socket.on("request_actor_list", () => io.emit("request_actor_list"));
    socket.on("receive_actor_list", (list) => io.emit("receive_actor_list", list));


    // --- 2. АВТОРИЗАЦІЯ ТА КІМНАТИ (🔥 ВАЖЛИВЕ ВИПРАВЛЕННЯ) ---

    socket.on("mobile_login_attempt", (data) => {
        // 🔒 КРОК 1: Телефон приєднується до приватної кімнати цього персонажа
        const roomName = `actor_${data.actorId}`;
        socket.join(roomName);
        console.log(`📱 Socket ${socket.id} joined room: ${roomName}`);

        // КРОК 2: Повідомляємо Foundry, що хтось хоче увійти (це бачить Foundry)
        io.emit("mobile_login_attempt", data);
    });

    // Результат логіну поки шлемо всім (телефон сам розбереться, чи це йому)
    // Але завдяки кімнатам дані не перемішаються
    socket.on("login_success", () => io.emit("login_success"));
    socket.on("login_failed", () => io.emit("login_failed"));


    // --- 3. СИНХРОНІЗАЦІЯ ДАНИХ (🔥 ІЗОЛЯЦІЯ) ---

    socket.on("request_sheet_data", (id) => io.emit("request_sheet_data", id));

    // 🏆 ГОЛОВНИЙ ФІКС: Відправляємо дані ТІЛЬКИ в кімнату цього персонажа
    socket.on("receive_sheet_data", (data) => {
        if (data && data.id) {
            const roomName = `actor_${data.id}`;
            // io.to(...) відправляє тільки підписникам цієї кімнати
            io.to(roomName).emit("receive_sheet_data", data);
            // console.log(`📦 Data sent to room: ${roomName}`); // розкоментуй для дебагу
        }
    });


    // --- 4. МАПА ТА ТОКЕНИ (Спільний простір) ---
    // Мапу бачать усі однаково, тому тут broadcast (emit)
    socket.on("send_map_data", (data) => io.emit("receive_map_data", data));
    socket.on("send_tokens", (data) => io.emit("receive_tokens", data));

    // Рух токена відправляємо у Foundry
    socket.on("mobile_move_token", (data) => io.emit("mobile_move_token", data));


    // --- 5. КИДКИ ТА ДІЇ (Телефон -> Foundry) ---
    // Тут просто пересилаємо команди від телефону до Foundry
    socket.on("mobile_roll_skill", (data) => io.emit("mobile_roll_skill", data));
    socket.on("mobile_roll_ability", (data) => io.emit("mobile_roll_ability", data));
    socket.on("mobile_roll_save", (data) => io.emit("mobile_roll_save", data));
    socket.on("mobile_use_item", (data) => io.emit("mobile_use_item", data));
    socket.on("mobile_roll_damage", (data) => io.emit("mobile_roll_damage", data));


    // --- 6. ЧАТ (Загальний) ---
    // Чат має бути спільним, щоб усі бачили повідомлення один одного
    socket.on("foundry_chat_message", (data) => io.emit("phone_chat_message", data));
    socket.on("mobile_chat_message", (data) => io.emit("mobile_chat_message", data));


    socket.on("disconnect", () => console.log(`❌ Disconnected: ${socket.id}`));
});

httpServer.listen(PORT, () => console.log(`🚀 Bridge running on port ${PORT}`));
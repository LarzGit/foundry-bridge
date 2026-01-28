const http = require("http");
const { Server } = require("socket.io");

const PORT = process.env.PORT || 3000;

// 1. Створюємо веб-сервер, який вміє говорити "Привіт"
const httpServer = http.createServer((req, res) => {
    // Якщо браузер просить головну сторінку "/"
    if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.write(`
            <html>
                <body style="background: #222; color: #0f0; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh;">
                    <h1>🟢 SERVER ONLINE: ${new Date().toLocaleTimeString()}</h1>
                </body>
            </html>
        `);
        res.end();
    } else {
        // Для всіх інших запитів
        res.writeHead(404);
        res.end();
    }
});

// 2. Підключаємо Socket.IO (для телефону і Foundry)
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Дозволяємо підключення звідусіль
        methods: ["GET", "POST"]
    },
});

console.log(`🌉 BRIDGE | Запуск на порту ${PORT}`);

io.on("connection", (socket) => {
    console.log(`🔌 Клієнт підключився: ${socket.id}`);

    // Логіка пересилання даних
    socket.on("foundry_update_hp", (data) => io.emit("phone_update_hp", data));
    socket.on("login_response", (data) => io.emit("login_response", data));
    socket.on("login_request", (id) => io.emit("check_login", id));
    socket.on("mobile_roll", (data) => io.emit("foundry_do_roll", data));
    socket.on("mobile_ability_check", (data) => io.emit("foundry_do_ability", data));
});

// 3. ЗАПУСКАЄМО СЕРВЕР
httpServer.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
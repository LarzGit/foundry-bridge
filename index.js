const { Server } = require("socket.io");

// Хмара сама скаже, який порт використовувати через process.env.PORT
// Якщо ми локально - то 3000
const PORT = process.env.PORT || 3000;

const io = new Server(PORT, {
    cors: {
        origin: "*", // Дозволяємо підключення з будь-якої точки світу
        methods: ["GET", "POST"]
    },
});

console.log(`🌉 BRIDGE | Сервер слухає порт ${PORT}`);

io.on("connection", (socket) => {
    // ... весь твій старий код connection залишається тут ...
    console.log(`🔌 Нове підключення: ${socket.id}`);

    // ТУТ МАЄ БУТИ ВЕСЬ КОД (on 'foundry_update_hp', on 'mobile_roll' тощо)
    // Який ми писали раніше. Не видаляй логіку!

    // (Скопіюй сюди внутрішності з минулого файлу)

    socket.on("foundry_update_hp", (data) => io.emit("phone_update_hp", data));
    socket.on("login_response", (data) => io.emit("login_response", data));
    socket.on("login_request", (id) => io.emit("check_login", id));
    socket.on("mobile_roll", (data) => io.emit("foundry_do_roll", data));
    socket.on("mobile_ability_check", (data) => io.emit("foundry_do_ability", data));
});

// Для Render іноді треба запустити "пустий" HTTP сервер, щоб він не падав
// Але для socket.io v4 standalone зазвичай цього вистачає.
// Давай поки залишимо так.
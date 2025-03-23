const express = require("express");
const fs = require("fs");
const useragent = require("useragent");
const cors = require("cors");

const app = express();
const PORT = 3000;
app.use(cors());

// Middleware: İstifadəçi məlumatlarını toplayır
app.use((req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const agent = useragent.parse(req.headers["user-agent"]);

    const logEntry = {
        timestamp: new Date().toISOString(),
        ip: ip,
        browser: agent.family,
        os: agent.os.family,
        device: agent.device.family,
        url: req.originalUrl
    };

    // Log məlumatını logs.json faylına yazırıq
    fs.readFile("logs.json", (err, data) => {
        let logs = [];
        if (!err) {
            logs = JSON.parse(data);
        }
        logs.push(logEntry);
        fs.writeFile("logs.json", JSON.stringify(logs, null, 2), (err) => {
            if (err) console.error("Log yazıla bilmədi!", err);
        });
    });

    next();
});

// Ana səhifə
app.get("/", (req, res) => {
    res.send("User tracking system is running!");
});

// Logs faylını göstərmək üçün route
app.get("/logs", (req, res) => {
    fs.readFile("logs.json", (err, data) => {
        if (err) return res.status(500).send("Logs oxuna bilmədi!");
        res.json(JSON.parse(data));
    });
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda işləyir...`);
});

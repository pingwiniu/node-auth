const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");


const app = express();
app.use(cookieParser());
const PORT = 3000;

function load(basePath, currentPath = '') {
    const absolutePath = path.join(basePath, currentPath);

    const items = fs.readdirSync(absolutePath);
    items.forEach(item => {
        const itemPath = path.join(currentPath, item);
        const fullItemPath = path.join(absolutePath, item);

        if (fs.statSync(fullItemPath).isDirectory()) {
            load(basePath, itemPath);
        } else if (path.extname(item) === '.js') {
            const routePath = `/${currentPath}/${path.parse(item).name}`.replace(/\\/g, '/');
            const routeContent = fs.readFileSync(fullItemPath, 'utf-8');
            
            const methodRegex = /router\.(get|post|put|delete)\s*\(/g;
            const methods = [...routeContent.matchAll(methodRegex)].map(match => match[1]);

            methods.forEach(method => {
                const methodPath = `${routePath}`;
                const routeModule = require(fullItemPath);
                app.use(methodPath, routeModule);
                console.log(`Endpoint loaded: ${methodPath}, Method: ${method.toUpperCase()}`);
            });
        }
    });
}


console.log('\n');

load(path.join(__dirname, 'routes'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'landing.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'register.html'));
});

app.get('/panel', (req, res) => {
    try {
        const token = req.cookies.token;

        if (token) {
            try {
                const decodedToken = jwt.verify(token, 'secret-key-lmao');

                if (decodedToken) {
                    res.sendFile(path.join(__dirname, 'frontend', 'panel.html'));
                } else {
                    res.redirect('/login');
                }
            } catch (error) {
                res.redirect('/login');
            }
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        res.redirect('/login');
    }
});


app.listen(PORT, () => {
    console.log(`\nServer is running on port ${PORT}`);
});

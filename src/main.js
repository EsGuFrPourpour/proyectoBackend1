const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const { Server } = require('socket.io');
const productRouter = require('./routes/products');
const cartRouter = require('./routes/carts');
const viewsRouter = require('./routes/views');

const app = express();
const PORT = 8080;

// Configurar Handlebars
app.engine('handlebars', exphbs.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/api/products', productRouter);
app.use('/api/carts', cartRouter);
app.use('/', viewsRouter);

// Crear servidor HTTP
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Configurar Socket.IO
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Cliente Socket.IO conectado:', socket.id);
  socket.on('disconnect', () => {
    console.log('Cliente Socket.IO desconectado:', socket.id);
  });
});

module.exports = { app, io }; // Exportar io para usarlo en otros módulos
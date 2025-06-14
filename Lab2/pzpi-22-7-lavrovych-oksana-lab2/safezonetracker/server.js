const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const sequelize = require('./db');
const userRouter = require('./routes/userRoutes');
const userAlertRouter = require('./routes/userAlertRoutes');
const alertRouter = require('./routes/alertRoutes');
const threatRouter = require('./routes/threatRoutes');
const locationRouter = require('./routes/locationRoutes');
const IotDataRouter = require('./routes/IoTDataRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

const app = express();
const port = 3000;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for managing users, alerts, and more',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cors());
app.use(bodyParser.json());

app.use(userRouter);
app.use(userAlertRouter);
app.use(alertRouter);
app.use(threatRouter);
app.use(locationRouter);
app.use(IotDataRouter);
app.use('/api', statisticsRoutes);

// Синхронізація бази даних та запуск сервера
(async () => {
  try {
    // 1. Синхронізуємо базу даних
    await sequelize.sync();
    console.log('Database synchronized successfully.');

    // 2. ЗАПУСКАЄМО MQTT-КЛІЄНТ
    // Цей require виконає код у файлі mqtt-client.js,
    // підключиться до брокера і встановить слухачів.
    require('./mqtt-client'); 

    // 3. Запускаємо веб-сервер
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
    
  } catch (error) {
    console.error('Error starting the server or syncing the database:', error);
  }
})();
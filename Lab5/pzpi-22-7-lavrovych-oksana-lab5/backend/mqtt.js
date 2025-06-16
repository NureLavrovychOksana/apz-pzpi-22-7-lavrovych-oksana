const mqtt = require('mqtt');
const { processNewSensorData } = require('./services/threatService'); // <-- Импортируем центральную функцию

// Подключение к MQTT брокеру
const client = mqtt.connect('mqtt://test.mosquitto.org');

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('iot/project/data', (err) => {
    if (!err) {
      console.log('Subscribed to topic: iot/project/data');
    } else {
      console.error('Failed to subscribe:', err);
    }
  });
});

client.on('message', async (topic, message) => {
  console.log(`Received message from ${topic}: ${message.toString()}`);

  try {
    const data = JSON.parse(message.toString());

    // Формируем объект с данными, включая значения по умолчанию
    const sensorData = {
      temperature: data.temperature || 22.0,
      humidity: data.humidity || 50.0,
      gas_level: data.gas_ppm || 0,
      smoke_detected: (data.smoke_ppm || 0) > 30, // Преобразуем в boolean
      location_id: 4, // Или получаем из данных, если возможно
    };

    // Вызываем единую функцию для обработки данных
    await processNewSensorData(sensorData);

  } catch (error) {
    console.error('Error processing MQTT message:', error.message);
  }
});

client.on('error', (error) => {
    console.error('MQTT Client Error:', error);
});
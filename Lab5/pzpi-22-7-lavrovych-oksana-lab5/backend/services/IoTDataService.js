const IoTData = require("../models/iotdata");

// Створити нові IoT дані
const createIoTData = async (data) => {
  try {
    const iotData = await IoTData.create(data);
    return iotData;
  } catch (error) {
    throw new Error('Error creating IoT data');
  }
};

// Отримати всі IoT дані
const getAllIoTData = async () => {
  try {
    const iotData = await IoTData.findAll();
    return iotData;
  } catch (error) {
    throw new Error('Error retrieving IoT data');
  }
};

// Отримати IoT дані за ID
const getIoTDataById = async (id) => {
  try {
    const iotData = await IoTData.findByPk(id);
    if (!iotData) throw new Error('IoT data not found');
    return iotData;
  } catch (error) {
    throw new Error('Error retrieving IoT data');
  }
};

// Отримати IoT дані за рівнем тривоги
const getIoTDataByAlertLevel = async (alertLevel) => {
  try {
    const iotData = await IoTData.findAll({
      where: {
        alert_level: alertLevel,
      },
    });
    return iotData;
  } catch (error) {
    throw new Error('Error retrieving IoT data by alert level');
  }
};

// Отримати останні дані IoT для моніторингу
const getRecentIoTData = async () => {
  try {
    const iotData = await IoTData.findAll({
      order: [['timestamp', 'DESC']], // Сортуємо за датою, щоб отримати останні
      limit: 10, // Останні 10 записів
    });
    return iotData;
  } catch (error) {
    throw new Error('Error retrieving recent IoT data');
  }
};
const cleanupOldIoTData = async (beforeDate) => {
    try {
      // Видаляємо дані, створені до вказаної дати
      const result = await IoTData.destroy({
        where: {
          timestamp: {
            [Op.lt]: beforeDate, // Використовуємо оператор менше
          },
        },
      });
  
      // Записуємо інформацію про очищення в логах
      await Log.create({
        action: 'cleanup',
        details: `Видалено IoT-дані до дати: ${beforeDate}`,
        deletedCount: result,
      });
  
      return result; // Повертаємо кількість видалених записів
    } catch (error) {
      console.error(error);
      throw new Error('Не вдалося очистити старі IoT-дані.');
    }
  };

module.exports = {
  createIoTData,
  getAllIoTData,
  getIoTDataById,
  getIoTDataByAlertLevel,
  getRecentIoTData,
  cleanupOldIoTData,
};

require('dotenv').config();

const app = require('./src/app');
const connectDatabase = require('./src/config/database');

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`Student Discussion Forum API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the API:', error.message);
    process.exit(1);
  }
}

startServer();

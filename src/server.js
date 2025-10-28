require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./db/mongo');
const { config } = require('./config');

const PORT = config.port || 3000;

connectDB()
  .then(() => {
    // store port in the app so other parts can read it (app.get('PORT'))
    app.set('PORT', PORT);
    app.listen(PORT, () => console.log(`Server on port http://localhost:${app.get('PORT')}`));
  })
  .catch(err => {
    console.error('Failed to start server', err);
    process.exit(1);
  });

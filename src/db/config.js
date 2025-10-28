// Load DB configuration from environment when possible. Avoid hardcoding credentials.
/*const config = {
  port: process.env.PORT || 3000,
  dbuser: process.env.DBUSER || '',
  dbpassword: process.env.DBPASSWORD || '',
  cluster: process.env.MONGO_CLUSTER || '',
  dbname: process.env.DB_NAME || process.env.DBNAME || 'ecommerce2',
  get mongo_url() {
    // Build an Atlas-style connection string only if we have the required components
    if (this.dbuser && this.dbpassword && this.cluster) {
      return `mongodb+srv://${this.dbuser}:${this.dbpassword}@${this.cluster}/${this.dbname}?retryWrites=true&w=majority`;
    }
    return '';
  }
};

module.exports = { config };*/

// Load DB configuration from environment when possible. Avoid hardcoding credentials.
const config = {
  port: process.env.PORT || 3000,
  dbuser: process.env.DBUSER || '',
  dbpassword: process.env.DBPASSWORD || '',
  cluster: process.env.MONGO_CLUSTER || '',
  dbname: process.env.DB_NAME || process.env.DBNAME || 'ecommerce',
  get mongo_url() {
    // Build an Atlas-style connection string only if we have the required components
    if (this.dbuser && this.dbpassword && this.cluster) {
      return `mongodb+srv://${this.dbuser}:${this.dbpassword}@${this.cluster}/${this.dbname}?retryWrites=true&w=majority`;
    }
    return '';
  }
};

module.exports = { config };


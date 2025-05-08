const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: ''
});

const setupDatabase = async () => {
  try {
    // Create database
    await connection.promise().query('CREATE DATABASE IF NOT EXISTS ums_db');
    console.log('Database created successfully');

    // Use the database
    await connection.promise().query('USE ums_db');

    // Create admins table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Admins table created successfully');

    // Create initial admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const insertAdminQuery = `
      INSERT INTO admins (email, password, name) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE email=email
    `;
    
    await connection.promise().query(insertAdminQuery, [
      'admin@ums.com',
      hashedPassword,
      'System Admin'
    ]);
    console.log('Initial admin user created successfully');

    console.log('Database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
};

setupDatabase(); 
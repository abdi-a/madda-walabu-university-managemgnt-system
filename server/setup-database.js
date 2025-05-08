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

    // Create instructors table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS instructors (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        department VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Instructors table created successfully');

    // Create students table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        student_id VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Students table created successfully');

    // Create courses table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_code VARCHAR(50) UNIQUE NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        credits INT NOT NULL,
        department VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Courses table created successfully');

    // Create offered_courses table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS offered_courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        course_id INT NOT NULL,
        instructor_id INT NOT NULL,
        semester VARCHAR(20) NOT NULL,
        year INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses(id),
        FOREIGN KEY (instructor_id) REFERENCES instructors(id)
      )
    `);
    console.log('Offered courses table created successfully');

    // Create student_courses table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS student_courses (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        offered_course_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (offered_course_id) REFERENCES offered_courses(id)
      )
    `);
    console.log('Student courses table created successfully');

    // Create student_marks table
    await connection.promise().query(`
      CREATE TABLE IF NOT EXISTS student_marks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_id INT NOT NULL,
        offered_course_id INT NOT NULL,
        activity_type VARCHAR(50) NOT NULL,
        marks DECIMAL(5,2) NOT NULL,
        total_marks DECIMAL(5,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (offered_course_id) REFERENCES offered_courses(id)
      )
    `);
    console.log('Student marks table created successfully');

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
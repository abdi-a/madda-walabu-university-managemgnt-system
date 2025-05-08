-- Active: 1746718723224@@127.0.0.1@3306
CREATE DATABASE IF NOT EXISTS ums_db;
USE ums_db;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructors table
CREATE TABLE IF NOT EXISTS instructors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(255) NOT NULL,
  credits INT NOT NULL,
  department VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Offered Courses table
CREATE TABLE IF NOT EXISTS offered_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT NOT NULL,
  instructor_id INT NOT NULL,
  semester ENUM('Spring', 'Fall', 'Summer') NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (instructor_id) REFERENCES instructors(id)
);

-- Student Course Registration table
CREATE TABLE IF NOT EXISTS student_courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  offered_course_id INT NOT NULL,
  registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (offered_course_id) REFERENCES offered_courses(id),
  UNIQUE KEY unique_registration (student_id, offered_course_id)
);

-- Student Marks table
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
);

-- Insert default admin
INSERT INTO admins (email, password, name) VALUES 
('admin@ums.edu', '$2a$10$your_hashed_password', 'System Admin')
ON DUPLICATE KEY UPDATE email=email; 
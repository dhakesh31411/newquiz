-- ===================================================
-- SriGanesh Friends Circle Database Schema
-- MySQL 8.0+ / MariaDB compatible
-- ===================================================

CREATE DATABASE IF NOT EXISTS `quizmaster_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `quizmaster_db`;

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Insert default admin if not exists (Username: admin, Password: sri ganesh26)
INSERT IGNORE INTO `admins` (`id`, `username`, `password_hash`) 
VALUES (1, 'admin', '$2a$10$wN9Q79VbV8H18q4ZgZ.9ueK4d.N9qV2bV8H18q4ZgZ.9ueK4d.N9q');

-- 2. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_users_phone` (`phone`)
) ENGINE=InnoDB;

-- 3. Quizzes Table
CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'General',
  `description` LONGTEXT,
  `image` LONGTEXT,
  `time_limit_seconds` INT NOT NULL DEFAULT 300,
  `total_questions` INT NOT NULL DEFAULT 5,
  `questions_per_player` INT DEFAULT 5,
  `random_questions` TINYINT(1) DEFAULT 1,
  `random_answers` TINYINT(1) DEFAULT 1,
  `randomization_mode` VARCHAR(50) DEFAULT 'random_questions_random_answers',
  `difficulty` VARCHAR(20) DEFAULT 'Medium',
  `max_attempts` INT DEFAULT 3,
  `is_active` TINYINT(1) DEFAULT 1,
  `is_quiz_of_day` TINYINT(1) DEFAULT 0,
  `is_scheduled` TINYINT(1) DEFAULT 0,
  `start_time` DATETIME DEFAULT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. Questions Table
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `quiz_id` INT NOT NULL,
  `category` VARCHAR(50) DEFAULT 'General',
  `type` VARCHAR(20) DEFAULT 'text',
  `question_text` LONGTEXT NOT NULL,
  `image` LONGTEXT,
  `images` LONGTEXT,
  `option_a` LONGTEXT NOT NULL,
  `option_b` LONGTEXT NOT NULL,
  `option_c` LONGTEXT NOT NULL,
  `option_d` LONGTEXT NOT NULL,
  `option_a_image` LONGTEXT,
  `option_b_image` LONGTEXT,
  `option_c_image` LONGTEXT,
  `option_d_image` LONGTEXT,
  `correct_option` ENUM('A', 'B', 'C', 'D') NOT NULL,
  `explanation` LONGTEXT,
  `difficulty` VARCHAR(20) DEFAULT 'Medium',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Quiz Attempts / Leaderboard Table
CREATE TABLE IF NOT EXISTS `attempts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `quiz_id` INT NOT NULL,
  `attempt_number` INT DEFAULT 1,
  `score` INT NOT NULL DEFAULT 0,
  `total_questions` INT NOT NULL DEFAULT 0,
  `percentage` INT DEFAULT 0,
  `correct_answers` INT DEFAULT 0,
  `wrong_answers` INT DEFAULT 0,
  `time_spent_seconds` INT NOT NULL DEFAULT 0,
  `completed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `is_first_attempt` TINYINT(1) DEFAULT 0,
  `is_final_leaderboard_score` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE,
  INDEX `idx_leaderboard` (`quiz_id`, `is_final_leaderboard_score`, `score` DESC, `time_spent_seconds` ASC)
) ENGINE=InnoDB;

-- 6. Settings Table
CREATE TABLE IF NOT EXISTS `settings` (
  `setting_key` VARCHAR(50) PRIMARY KEY,
  `setting_value` LONGTEXT NOT NULL
) ENGINE=InnoDB;


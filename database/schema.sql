```sql
-- ============================================================
-- GlobalTrotter Database Schema
-- ============================================================

-- Create database
CREATE DATABASE IF NOT EXISTS globetrotter;

USE globetrotter;


-- ============================================================
-- 1. USERS
-- Stores registered users
-- ============================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_photo VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================================
-- 2. TRIPS
-- Stores trips created by users
-- One user can have many trips
-- ============================================================

CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cover_photo VARCHAR(500),
    budget DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trips_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_trips_user_id (user_id),
    INDEX idx_trips_dates (start_date, end_date)
);


-- ============================================================
-- 3. CITIES
-- Master list of destinations available for search
-- ============================================================

CREATE TABLE cities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    cost_index DECIMAL(5, 2) DEFAULT 0.00,
    popularity INT DEFAULT 0,
    image_url VARCHAR(500),

    INDEX idx_cities_name (name),
    INDEX idx_cities_country (country),
    INDEX idx_cities_region (region)
);


-- ============================================================
-- 4. TRIP_STOPS
-- Cities selected for a particular trip
-- One trip can have many stops
-- ============================================================

CREATE TABLE trip_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    city_id INT NOT NULL,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    stop_order INT NOT NULL,

    CONSTRAINT fk_trip_stops_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trip_stops_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id),

    INDEX idx_trip_stops_trip_id (trip_id),
    INDEX idx_trip_stops_city_id (city_id),

    UNIQUE KEY unique_trip_stop_order (trip_id, stop_order)
);


-- ============================================================
-- 5. ACTIVITIES
-- Master list of activities available in cities
-- ============================================================

CREATE TABLE activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    duration_minutes INT,
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
    image_url VARCHAR(500),

    CONSTRAINT fk_activities_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id),

    INDEX idx_activities_city_id (city_id),
    INDEX idx_activities_category (category),
    INDEX idx_activities_name (name)
);


-- ============================================================
-- 6. ITINERARY_ACTIVITIES
-- Activities selected for a specific trip stop
-- ============================================================

CREATE TABLE itinerary_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_stop_id INT NOT NULL,
    activity_id INT NOT NULL,
    activity_date DATE NOT NULL,
    activity_time TIME,
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00,
    activity_order INT DEFAULT 0,

    CONSTRAINT fk_itinerary_activities_stop
        FOREIGN KEY (trip_stop_id)
        REFERENCES trip_stops(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_itinerary_activities_activity
        FOREIGN KEY (activity_id)
        REFERENCES activities(id),

    INDEX idx_itinerary_stop_id (trip_stop_id),
    INDEX idx_itinerary_activity_id (activity_id),
    INDEX idx_itinerary_date (activity_date),

    UNIQUE KEY unique_activity_order
        (trip_stop_id, activity_date, activity_order)
);


-- ============================================================
-- 7. EXPENSES
-- Stores expenses associated with a trip
-- ============================================================

CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    category ENUM(
        'transport',
        'stay',
        'activities',
        'meals',
        'other'
    ) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description VARCHAR(255),
    expense_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_expenses_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE,

    INDEX idx_expenses_trip_id (trip_id),
    INDEX idx_expenses_category (category),
    INDEX idx_expenses_date (expense_date)
);


-- ============================================================
-- 8. TRIP_SHARES
-- Stores public/shareable itinerary information
-- ============================================================

CREATE TABLE trip_shares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    share_token VARCHAR(100) NOT NULL UNIQUE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_trip_shares_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE,

    INDEX idx_trip_shares_trip_id (trip_id),
    INDEX idx_trip_shares_token (share_token)
);


-- ============================================================
-- DATABASE COMPLETE
-- ============================================================
```

// storing the SQL query for creating a PostgreSQL DB schema and exporting it to the db.js file,
//  where this shall be executed

export const createSchemaSQL = `
CREATE SCHEMA IF NOT EXISTS calendarAPI_schema;

-- Table 1: Users
CREATE TABLE IF NOT EXISTS calendarAPI_schema.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- Table 2: Meetings
CREATE TABLE IF NOT EXISTS calendarAPI_schema.meetings (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES calendarAPI_schema.users(id) ON DELETE CASCADE
);
`;

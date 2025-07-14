DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS cart;

-- teachers and students
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  email TEXT NOT NULL UNIQUE, -- log in identity
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role TEXT CHECK(role IN ('teacher', 'student')) NOT NULL
);

-- created by teachers
CREATE TABLe courses (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  subject TEXT NOT NULL,
  credits INTEGER NOT NULL,
  creator_id INTEGER NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

--keeps track of selections

CREATE TABLE cart (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  course_id INTEGER NOT NULL,
  order_num TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);
-- Reference schema for the Firebase data model / future SQL migration.

CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(150),
  category VARCHAR(80),
  price DECIMAL(10,
  2),
  stock INT,
  craft VARCHAR(150),
  description TEXT,
  image VARCHAR(255)
);

CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(120),
  email VARCHAR(180),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT,
  total DECIMAL(10,
  2),
  status VARCHAR(40),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id INT PRIMARY KEY,
  order_id INT,
  product_id INT,
  quantity INT,
  price DECIMAL(10,
  2)
);

CREATE TABLE messages (
  id INT PRIMARY KEY,
  name VARCHAR(120),
  email VARCHAR(180),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

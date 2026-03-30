-- Migration: add seller_id to orders and backfill values.
-- Notes:
-- 1) Run on a backup first.
-- 2) This script assumes MySQL/InnoDB.

ALTER TABLE orders
  ADD COLUMN seller_id INT NULL,
  ADD INDEX ix_orders_seller_id (seller_id);

-- Backfill seller_id from order_items -> products.
UPDATE orders o
JOIN (
  SELECT oi.order_id, MIN(p.seller_id) AS seller_id
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  GROUP BY oi.order_id
) x ON x.order_id = o.id
SET o.seller_id = x.seller_id;

-- Detect inconsistent historic orders (multi-vendors in one order).
-- If this returns rows, correct/archive them before enforcing NOT NULL.
SELECT oi.order_id, COUNT(DISTINCT p.seller_id) AS sellers_count
FROM order_items oi
JOIN products p ON p.id = oi.product_id
GROUP BY oi.order_id
HAVING COUNT(DISTINCT p.seller_id) > 1;

-- Optional hardening after manual cleanup of inconsistent records:
-- ALTER TABLE orders MODIFY seller_id INT NOT NULL;
-- ALTER TABLE orders
--   ADD CONSTRAINT fk_orders_seller_id
--   FOREIGN KEY (seller_id) REFERENCES users(id);

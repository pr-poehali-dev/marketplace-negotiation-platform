CREATE TABLE IF NOT EXISTS seller_documents (
  id SERIAL PRIMARY KEY,
  seller_id integer NOT NULL REFERENCES seller_profiles(id),
  doc_type character varying(50) NOT NULL,
  file_url text NOT NULL,
  status character varying(20) NOT NULL DEFAULT 'pending',
  uploaded_at timestamp without time zone NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  product_id integer NOT NULL REFERENCES products(id),
  buyer_id integer NOT NULL REFERENCES users(id),
  rating integer NOT NULL,
  comment text NULL DEFAULT '',
  created_at timestamp without time zone NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS banners (
  id SERIAL PRIMARY KEY,
  title character varying(255) NOT NULL,
  subtitle character varying(255) NULL DEFAULT '',
  button_text character varying(100) NULL DEFAULT '',
  button_link character varying(255) NULL DEFAULT '',
  gradient character varying(255) NULL DEFAULT '',
  emoji character varying(20) NULL DEFAULT '',
  image_url text NULL DEFAULT '',
  sort_order integer NULL DEFAULT 0,
  active boolean NULL DEFAULT true,
  created_at timestamp without time zone NULL DEFAULT now()
);

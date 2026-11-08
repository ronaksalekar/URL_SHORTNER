CREATE TABLE urls (
    id            BIGSERIAL PRIMARY KEY,
    short_code    VARCHAR(10)  NOT NULL UNIQUE,
    long_url      TEXT         NOT NULL,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    expires_at    TIMESTAMPTZ  NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT true
);

CREATE UNIQUE INDEX idx_urls_short_code ON urls (short_code);

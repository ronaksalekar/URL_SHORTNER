CREATE TABLE clicks (
    id            BIGSERIAL PRIMARY KEY,
    url_id        BIGINT       NOT NULL REFERENCES urls(id) ON DELETE CASCADE,
    clicked_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    referrer      TEXT         NULL,
    ip_address    INET         NULL,
    user_agent    TEXT         NULL
);

CREATE INDEX idx_clicks_url_id_clicked_at ON clicks (url_id, clicked_at);
CREATE INDEX idx_clicks_referrer ON clicks (referrer);

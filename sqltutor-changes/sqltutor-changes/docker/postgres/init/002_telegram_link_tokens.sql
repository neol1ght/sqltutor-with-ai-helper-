CREATE TABLE telegram_link_tokens (
                                      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

                                      user_id UUID NOT NULL,

                                      token_hash VARCHAR(255) NOT NULL UNIQUE,

                                      expires_at TIMESTAMPTZ(6) NOT NULL,

                                      used_at TIMESTAMPTZ(6),

                                      created_at TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

                                      CONSTRAINT fk_telegram_link_tokens_user
                                          FOREIGN KEY (user_id)
                                              REFERENCES users(id)
                                              ON DELETE CASCADE
                                              ON UPDATE NO ACTION
);

CREATE INDEX telegram_link_tokens_user_id_idx
    ON telegram_link_tokens(user_id);

CREATE INDEX telegram_link_tokens_expires_at_idx
    ON telegram_link_tokens(expires_at);
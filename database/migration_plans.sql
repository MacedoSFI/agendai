-- Adiciona campos de plano na tabela users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS plan VARCHAR(20) DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ;

-- Atualiza usuários já existentes que não têm trial_ends_at
UPDATE users SET trial_ends_at = created_at + INTERVAL '30 days' WHERE trial_ends_at IS NULL;

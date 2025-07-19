-- Add new columns for guia local information
ALTER TABLE viagens
ADD COLUMN IF NOT EXISTS nomeguialocal TEXT,
ADD COLUMN IF NOT EXISTS whatsappguialocal TEXT;

-- Comment on the new columns
COMMENT ON COLUMN viagens.nomeguialocal IS 'Nome do guia local para a viagem';
COMMENT ON COLUMN viagens.whatsappguialocal IS 'Número de WhatsApp do guia local para a viagem';

-- À exécuter une seule fois sur une base marketplace_db déjà créée.
ALTER TABLE panier_items
    ADD COLUMN est_enregistre TINYINT(1) NOT NULL DEFAULT 0 AFTER quantite;

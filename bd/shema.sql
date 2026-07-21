-- ============================================================
--  SCRIPT DE CREATION DE BASE DE DONNEES - MARKETPLACE
--  MySQL 8.0+
--  L'ordre des CREATE TABLE respecte les dependances (FK)
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP DATABASE IF EXISTS marketplace_db;
CREATE DATABASE marketplace_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE marketplace_db;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. UTILISATEURS
-- ============================================================
CREATE TABLE UTILISATEURS (
    id_user             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom                 VARCHAR(100)   NOT NULL,
    prenom              VARCHAR(100)   NOT NULL,
    email               VARCHAR(150)   NOT NULL UNIQUE,
    password            VARCHAR(255)   NOT NULL,
    tele                VARCHAR(20),
    logo_url            VARCHAR(255),
    role                ENUM('client','vendeur','admin') NOT NULL DEFAULT 'client',
    statut              ENUM('actif','inactif','suspendu') NOT NULL DEFAULT 'actif',
    date_creation       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion  DATETIME NULL
) ENGINE=InnoDB;

-- ============================================================
-- 2. ADRESSES  (1 UTILISATEUR -> N ADRESSES)
-- ============================================================
CREATE TABLE ADRESSES (
    id_adresse      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user         INT UNSIGNED NOT NULL,
    libelle         VARCHAR(100),
    ligne1          VARCHAR(255) NOT NULL,
    ville           VARCHAR(100) NOT NULL,
    code_postal     VARCHAR(20)  NOT NULL,
    tele            VARCHAR(20),
    est_defaut      TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_adresses_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3. BOUTIQUES  (1 UTILISATEUR -> N BOUTIQUES)
-- ============================================================
CREATE TABLE BOUTIQUES (
    id_boutique     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user         INT UNSIGNED NOT NULL,
    nom             VARCHAR(150) NOT NULL,
    slug            VARCHAR(170) NOT NULL UNIQUE,
    description     TEXT,
    logo_url        VARCHAR(255),
    banniere_url    VARCHAR(255),
    statut          ENUM('actif','inactif','suspendu') NOT NULL DEFAULT 'actif',
    note_moyenne    DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    nbr_abonnes     INT UNSIGNED NOT NULL DEFAULT 0,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_boutiques_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 3bis. INFOBOUTIQUE  (1 BOUTIQUE -> 1 informations de contact)
-- ============================================================
CREATE TABLE INFOBOUTIQUE (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_boutique     INT UNSIGNED NOT NULL UNIQUE,
    adresse         VARCHAR(255) NULL,
    tele            VARCHAR(30) NULL,
    emailprof       VARCHAR(255) NULL,
    instagram       VARCHAR(255) NULL,
    facebook        VARCHAR(255) NULL,
    CONSTRAINT fk_infoboutique_boutique
        FOREIGN KEY (id_boutique) REFERENCES BOUTIQUES(id_boutique)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 4. CATEGORIES  (auto-association : categorie parente)
-- ============================================================
CREATE TABLE CATEGORIES (
    id_categorie         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom                  VARCHAR(100) NOT NULL,
    icone                VARCHAR(255),
    id_categorie_parent  INT UNSIGNED NULL,
    CONSTRAINT fk_categories_parent
        FOREIGN KEY (id_categorie_parent) REFERENCES CATEGORIES(id_categorie)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 5. PRODUITS  (1 BOUTIQUE -> N PRODUITS, 1 CATEGORIE -> N PRODUITS)
-- ============================================================
CREATE TABLE PRODUITS (
    id_produit      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_boutique     INT UNSIGNED NOT NULL,
    id_categorie    INT UNSIGNED NULL,
    nom             VARCHAR(200) NOT NULL,
    description     TEXT,
    prix            DECIMAL(10,2) NOT NULL,
    stock           INT UNSIGNED NOT NULL DEFAULT 0,
    statut          ENUM('brouillon','en_ligne','rupture','archive') NOT NULL DEFAULT 'brouillon',
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_maj        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_produits_boutique
        FOREIGN KEY (id_boutique) REFERENCES BOUTIQUES(id_boutique)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_produits_categorie
        FOREIGN KEY (id_categorie) REFERENCES CATEGORIES(id_categorie)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 6. PRODUIT_MEDIAS  (1 PRODUIT -> N MEDIAS)
-- ============================================================
CREATE TABLE PRODUIT_MEDIAS (
    id_media    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_produit  INT UNSIGNED NOT NULL,
    type        ENUM('image','video') NOT NULL DEFAULT 'image',
    url         VARCHAR(255) NOT NULL,
    ordre       SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    CONSTRAINT fk_produit_medias_produit
        FOREIGN KEY (id_produit) REFERENCES PRODUITS(id_produit)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. PANIER_ITEMS  (1 UTILISATEUR -> N ITEMS, 1 PRODUIT -> N ITEMS)
-- ============================================================
CREATE TABLE PANIER_ITEMS (
    id_panier_item  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user         INT UNSIGNED NOT NULL,
    id_produit      INT UNSIGNED NOT NULL,
    quantite        INT UNSIGNED NOT NULL DEFAULT 1,
    date_ajout      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_panier_items_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_panier_items_produit
        FOREIGN KEY (id_produit) REFERENCES PRODUITS(id_produit)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_panier_user_produit UNIQUE (id_user, id_produit)
) ENGINE=InnoDB;

-- ============================================================
-- 8. COMMANDES  (1 UTILISATEUR -> N COMMANDES, 1 ADRESSE -> N COMMANDES)
-- ============================================================
CREATE TABLE COMMANDES (
    id_commande     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user         INT UNSIGNED NOT NULL,
    id_adresse      INT UNSIGNED NOT NULL,
    statut          ENUM('en_attente','confirmee','expediee','livree','annulee','remboursee') NOT NULL DEFAULT 'en_attente',
    montant_total   DECIMAL(10,2) NOT NULL,
    date_commande   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_commandes_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_commandes_adresse
        FOREIGN KEY (id_adresse) REFERENCES ADRESSES(id_adresse)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. COMMANDE_LIGNES  (1 COMMANDE -> N LIGNES, 1 PRODUIT -> N LIGNES,
--                      1 BOUTIQUE -> N LIGNES)
-- ============================================================
CREATE TABLE COMMANDE_LIGNES (
    id_commande_ligne   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_commande         INT UNSIGNED NOT NULL,
    id_produit          INT UNSIGNED NOT NULL,
    id_boutique         INT UNSIGNED NOT NULL,
    quantite            INT UNSIGNED NOT NULL,
    prix_unitaire       DECIMAL(10,2) NOT NULL,
    sous_total          DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_commande_lignes_commande
        FOREIGN KEY (id_commande) REFERENCES COMMANDES(id_commande)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_commande_lignes_produit
        FOREIGN KEY (id_produit) REFERENCES PRODUITS(id_produit)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_commande_lignes_boutique
        FOREIGN KEY (id_boutique) REFERENCES BOUTIQUES(id_boutique)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 10. MOYENS_PAIEMENT  (1 UTILISATEUR -> N MOYENS_PAIEMENT)
-- ============================================================
CREATE TABLE MOYENS_PAIEMENT (
    id_moyen_paiement   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user             INT UNSIGNED NOT NULL,
    fournisseur         VARCHAR(100) NOT NULL,
    type                ENUM('carte','portefeuille','virement','autre') NOT NULL DEFAULT 'carte',
    jeton_paiement      VARCHAR(255) NOT NULL,
    derniers_chiffres   VARCHAR(4),
    date_expiration     DATE NULL,
    est_defaut          TINYINT(1) NOT NULL DEFAULT 0,
    date_creation       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_moyens_paiement_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 11. PAIEMENTS  (1 COMMANDE -> N PAIEMENTS, 1 MOYEN_PAIEMENT -> N PAIEMENTS)
-- ============================================================
CREATE TABLE PAIEMENTS (
    id_paiement             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_commande             INT UNSIGNED NOT NULL,
    id_moyen_paiement       INT UNSIGNED NULL,
    montant                 DECIMAL(10,2) NOT NULL,
    methode                 VARCHAR(50) NOT NULL,
    fournisseur             VARCHAR(100),
    statut                  ENUM('en_attente','valide','echoue','rembourse') NOT NULL DEFAULT 'en_attente',
    reference_transaction   VARCHAR(150),
    date_paiement           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_paiements_commande
        FOREIGN KEY (id_commande) REFERENCES COMMANDES(id_commande)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_paiements_moyen_paiement
        FOREIGN KEY (id_moyen_paiement) REFERENCES MOYENS_PAIEMENT(id_moyen_paiement)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. REMBOURSEMENTS  (1 PAIEMENT -> N REMBOURSEMENTS,
--                      1 COMMANDE_LIGNE -> N REMBOURSEMENTS,
--                      1 ADMIN (UTILISATEUR) -> N REMBOURSEMENTS traites)
-- ============================================================
CREATE TABLE REMBOURSEMENTS (
    id_remboursement    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_paiement         INT UNSIGNED NOT NULL,
    id_commande_ligne   INT UNSIGNED NOT NULL,
    montant             DECIMAL(10,2) NOT NULL,
    motif               VARCHAR(255),
    statut              ENUM('demande','approuve','refuse','traite') NOT NULL DEFAULT 'demande',
    id_admin            INT UNSIGNED NULL,
    date_demande        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_traitement     DATETIME NULL,
    CONSTRAINT fk_remboursements_paiement
        FOREIGN KEY (id_paiement) REFERENCES PAIEMENTS(id_paiement)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_remboursements_commande_ligne
        FOREIGN KEY (id_commande_ligne) REFERENCES COMMANDE_LIGNES(id_commande_ligne)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_remboursements_admin
        FOREIGN KEY (id_admin) REFERENCES UTILISATEURS(id_user)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 13. FAVORIS  (1 UTILISATEUR -> N FAVORIS, 1 PRODUIT -> N FAVORIS)
-- ============================================================
CREATE TABLE FAVORIS (
    id_favori   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user     INT UNSIGNED NOT NULL,
    id_produit  INT UNSIGNED NOT NULL,
    date_ajout  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favoris_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_favoris_produit
        FOREIGN KEY (id_produit) REFERENCES PRODUITS(id_produit)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_favoris_user_produit UNIQUE (id_user, id_produit)
) ENGINE=InnoDB;

-- ============================================================
-- 14. BOUTIQUES_SUIVIES  (N-N entre UTILISATEURS et BOUTIQUES)
-- ============================================================
CREATE TABLE BOUTIQUES_SUIVIES (
    id_boutique_suivie  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user             INT UNSIGNED NOT NULL,
    id_boutique         INT UNSIGNED NOT NULL,
    date_suivi          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_boutiques_suivies_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_boutiques_suivies_boutique
        FOREIGN KEY (id_boutique) REFERENCES BOUTIQUES(id_boutique)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_boutiques_suivies_user_boutique UNIQUE (id_user, id_boutique)
) ENGINE=InnoDB;

-- ============================================================
-- 15. AVIS  (1 PRODUIT -> N AVIS, 1 UTILISATEUR -> N AVIS)
-- ============================================================
CREATE TABLE AVIS (
    id_avis         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_produit      INT UNSIGNED NOT NULL,
    id_user         INT UNSIGNED NOT NULL,
    note            TINYINT UNSIGNED NOT NULL CHECK (note BETWEEN 1 AND 5),
    commentaire     TEXT,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_avis_produit
        FOREIGN KEY (id_produit) REFERENCES PRODUITS(id_produit)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_avis_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 16. CONVERSATIONS  (1 UTILISATEUR -> N CONVERSATIONS, 1 BOUTIQUE -> N CONVERSATIONS)
-- ============================================================
CREATE TABLE CONVERSATIONS (
    id_conversation INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user         INT UNSIGNED NOT NULL,
    id_boutique     INT UNSIGNED NOT NULL,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_maj        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversations_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_conversations_boutique
        FOREIGN KEY (id_boutique) REFERENCES BOUTIQUES(id_boutique)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 17. MESSAGES  (1 CONVERSATION -> N MESSAGES, 1 UTILISATEUR (auteur) -> N MESSAGES,
--                1 PRODUIT (optionnel) -> N MESSAGES)
-- ============================================================
CREATE TABLE MESSAGES (
    id_message      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_conversation INT UNSIGNED NOT NULL,
    id_user         INT UNSIGNED NOT NULL,
    id_produit      INT UNSIGNED NULL,
    contenu         TEXT NOT NULL,
    type_message    ENUM('texte','image','fichier','produit','systeme') NOT NULL DEFAULT 'texte',
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_maj        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (id_conversation) REFERENCES CONVERSATIONS(id_conversation)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_messages_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_messages_produit
        FOREIGN KEY (id_produit) REFERENCES PRODUITS(id_produit)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 18. MESSAGES_STATUTS  (1 MESSAGE -> N STATUTS, 1 UTILISATEUR -> N STATUTS)
-- ============================================================
CREATE TABLE MESSAGES_STATUTS (
    id_message_statut   INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_message          INT UNSIGNED NOT NULL,
    id_user             INT UNSIGNED NOT NULL,
    statut              ENUM('envoye','recu','lu') NOT NULL DEFAULT 'envoye',
    date_lecture        DATETIME NULL,
    CONSTRAINT fk_messages_statuts_message
        FOREIGN KEY (id_message) REFERENCES MESSAGES(id_message)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_messages_statuts_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_messages_statuts_message_user UNIQUE (id_message, id_user)
) ENGINE=InnoDB;

-- ============================================================
-- 19. MESSAGES_PIECES_JOINTES  (1 MESSAGE -> N PIECES_JOINTES)
-- ============================================================
CREATE TABLE MESSAGES_PIECES_JOINTES (
    id_piece_jointe INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_message      INT UNSIGNED NOT NULL,
    url_fichier     VARCHAR(255) NOT NULL,
    nom_fichier     VARCHAR(255),
    type_fichier    VARCHAR(100),
    taille_fichier  INT UNSIGNED,
    CONSTRAINT fk_messages_pieces_jointes_message
        FOREIGN KEY (id_message) REFERENCES MESSAGES(id_message)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 20. PROMOUVOIR  (1 PRODUIT -> N PROMOTIONS/mises en avant)
-- ============================================================
CREATE TABLE PROMOUVOIR (
    id_promotion    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_produit      INT UNSIGNED NOT NULL,
    plan            VARCHAR(100) NOT NULL,
    priorite        SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    date_debut      DATETIME NOT NULL,
    date_fin        DATETIME NOT NULL,
    statut          ENUM('en_attente','active','expiree','annulee') NOT NULL DEFAULT 'en_attente',
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_promouvoir_produit
        FOREIGN KEY (id_produit) REFERENCES PRODUITS(id_produit)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 21. SOLDES  (1 PRODUIT -> N SOLDES)
-- ============================================================
CREATE TABLE SOLDES (
    id_solde            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_produit          INT UNSIGNED NOT NULL,
    type_reduction      ENUM('pourcentage','montant_fixe') NOT NULL,
    valeur_reduction    DECIMAL(10,2) NOT NULL,
    prix_promo          DECIMAL(10,2) NOT NULL,
    date_debut          DATETIME NOT NULL,
    date_fin            DATETIME NOT NULL,
    statut              ENUM('en_attente','active','expiree','annulee') NOT NULL DEFAULT 'en_attente',
    date_creation       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_soldes_produit
        FOREIGN KEY (id_produit) REFERENCES PRODUITS(id_produit)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 22. SIGNALEMENTS  (1 UTILISATEUR (auteur) -> N SIGNALEMENTS,
--                    1 ADMIN (UTILISATEUR) -> N SIGNALEMENTS traites,
--                    id_cible = cle polymorphe, pas de FK stricte
--                    car type_cible peut pointer vers PRODUITS, BOUTIQUES,
--                    UTILISATEURS, AVIS, MESSAGES, etc.)
-- ============================================================
CREATE TABLE SIGNALEMENTS (
    id_signalement  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user         INT UNSIGNED NOT NULL,
    type_cible      ENUM('produit','boutique','utilisateur','avis','message') NOT NULL,
    id_cible        INT UNSIGNED NOT NULL,
    motif           VARCHAR(150) NOT NULL,
    description     TEXT,
    statut          ENUM('ouvert','en_cours','resolu','rejete') NOT NULL DEFAULT 'ouvert',
    id_admin        INT UNSIGNED NULL,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_traitement DATETIME NULL,
    CONSTRAINT fk_signalements_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_signalements_admin
        FOREIGN KEY (id_admin) REFERENCES UTILISATEURS(id_user)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 23. NOTIFICATIONS  (1 UTILISATEUR -> N NOTIFICATIONS)
-- ============================================================
CREATE TABLE NOTIFICATIONS (
    id_notification INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_user         INT UNSIGNED NOT NULL,
    type            VARCHAR(100) NOT NULL,
    contenu         TEXT NOT NULL,
    lien            VARCHAR(255),
    lu              TINYINT(1) NOT NULL DEFAULT 0,
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (id_user) REFERENCES UTILISATEURS(id_user)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 24. PUBLICITES  (1 BOUTIQUE -> N PUBLICITES, 1 PRODUIT -> N PUBLICITES)
-- ============================================================
CREATE TABLE PUBLICITES (
    id_publicite    INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_boutique     INT UNSIGNED NOT NULL,
    id_produit      INT UNSIGNED NULL,
    budget          DECIMAL(10,2) NOT NULL,
    cout_par_clic   DECIMAL(10,2) NOT NULL,
    impressions     INT UNSIGNED NOT NULL DEFAULT 0,
    clics           INT UNSIGNED NOT NULL DEFAULT 0,
    statut          ENUM('en_attente','active','en_pause','terminee') NOT NULL DEFAULT 'en_attente',
    date_debut      DATETIME NOT NULL,
    date_fin        DATETIME NOT NULL,
    CONSTRAINT fk_publicites_boutique
        FOREIGN KEY (id_boutique) REFERENCES BOUTIQUES(id_boutique)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_publicites_produit
        FOREIGN KEY (id_produit) REFERENCES PRODUITS(id_produit)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 25. REVENUS_VENDEUR  (1 BOUTIQUE -> N REVENUS, 1 COMMANDE_LIGNE -> 1 REVENU)
-- ============================================================
CREATE TABLE REVENUS_VENDEUR (
    id_revenu           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_boutique         INT UNSIGNED NOT NULL,
    id_commande_ligne   INT UNSIGNED NOT NULL,
    montant_brut        DECIMAL(10,2) NOT NULL,
    commission          DECIMAL(10,2) NOT NULL,
    montant_net         DECIMAL(10,2) NOT NULL,
    statut              ENUM('en_attente','disponible','verse','annule') NOT NULL DEFAULT 'en_attente',
    date                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_revenus_vendeur_boutique
        FOREIGN KEY (id_boutique) REFERENCES BOUTIQUES(id_boutique)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_revenus_vendeur_commande_ligne
        FOREIGN KEY (id_commande_ligne) REFERENCES COMMANDE_LIGNES(id_commande_ligne)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uq_revenus_vendeur_commande_ligne UNIQUE (id_commande_ligne)
) ENGINE=InnoDB;

-- ============================================================
-- INDEX SUPPLEMENTAIRES UTILES (recherche et performance)
-- ============================================================
CREATE INDEX idx_produits_categorie ON PRODUITS(id_categorie);
CREATE INDEX idx_produits_boutique ON PRODUITS(id_boutique);
CREATE INDEX idx_commandes_user ON COMMANDES(id_user);
CREATE INDEX idx_commande_lignes_commande ON COMMANDE_LIGNES(id_commande);
CREATE INDEX idx_messages_conversation ON MESSAGES(id_conversation);
CREATE INDEX idx_notifications_user_lu ON NOTIFICATIONS(id_user, lu);
CREATE INDEX idx_signalements_cible ON SIGNALEMENTS(type_cible, id_cible);

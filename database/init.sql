-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS ChecklisTI
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE ChecklisTI;

-- Sistemas
CREATE TABLE IF NOT EXISTS systems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

-- Agentes
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

-- Checklists (um por data)
CREATE TABLE IF NOT EXISTS checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    check_date DATE NOT NULL UNIQUE,
    saved_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

-- Itens do checklist
CREATE TABLE IF NOT EXISTS checklist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checklist_id INT NOT NULL,
    system_id INT NULL,
    agent_id INT NULL,
    status VARCHAR(50) NOT NULL,
    note VARCHAR(1000) NULL,
    last_check VARCHAR(200) NULL,
    CONSTRAINT fk_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
    CONSTRAINT fk_system FOREIGN KEY (system_id) REFERENCES systems(id),
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Insere sistemas padrão (se tabela vazia)
INSERT INTO systems (name)
SELECT 'ERP (Produção)'
WHERE NOT EXISTS (SELECT 1 FROM systems);

INSERT INTO systems (name)
SELECT 'ERP (Simulação)'
WHERE NOT EXISTS (SELECT 1 FROM systems WHERE name = 'ERP (Simulação)');

-- Insere agentes padrão (se tabela vazia)
INSERT INTO agents (name)
SELECT 'Administrador'
WHERE NOT EXISTS (SELECT 1 FROM agents);

INSERT INTO agents (name)
SELECT 'Maikon Lopes'
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE name = 'Maikon Lopes');
-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS ChecklisTI
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE ChecklisTI;

-- Sistemas
CREATE TABLE IF NOT EXISTS systems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

-- Agentes
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1
);

-- Checklists (um por data)
CREATE TABLE IF NOT EXISTS checklists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    check_date DATE NOT NULL UNIQUE,
    saved_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
);

-- Itens do checklist
CREATE TABLE IF NOT EXISTS checklist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    checklist_id INT NOT NULL,
    system_id INT NULL,
    agent_id INT NULL,
    status VARCHAR(50) NOT NULL,
    note VARCHAR(1000) NULL,
    last_check VARCHAR(200) NULL,
    CONSTRAINT fk_checklist FOREIGN KEY (checklist_id) REFERENCES checklists(id) ON DELETE CASCADE,
    CONSTRAINT fk_system FOREIGN KEY (system_id) REFERENCES systems(id),
    CONSTRAINT fk_agent FOREIGN KEY (agent_id) REFERENCES agents(id)
);

-- Insere sistemas padrão (se tabela vazia)
INSERT INTO systems (name)
SELECT 'ERP (Produção)'
WHERE NOT EXISTS (SELECT 1 FROM systems);

INSERT INTO systems (name)
SELECT 'ERP (Simulação)'
WHERE NOT EXISTS (SELECT 1 FROM systems WHERE name = 'ERP (Simulação)');

-- Insere agentes padrão (se tabela vazia)
INSERT INTO agents (name)
SELECT 'Administrador'
WHERE NOT EXISTS (SELECT 1 FROM agents);

INSERT INTO agents (name)
SELECT 'Maikon Lopes'
WHERE NOT EXISTS (SELECT 1 FROM agents WHERE name = 'Maikon Lopes');

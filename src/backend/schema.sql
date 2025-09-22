-- Script de criação do banco e tabelas para SQL Server
-- Ajuste o nome do banco conforme desejar
IF DB_ID('ChecklisTI') IS NULL
BEGIN
    CREATE DATABASE ChecklisTI;
END
GO

USE ChecklisTI;
GO

-- Sistemas
IF OBJECT_ID('dbo.systems','U') IS NULL
BEGIN
CREATE TABLE dbo.systems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
	is_active BIT NOT NULL DEFAULT 1
);
END
GO

-- Agentes
IF OBJECT_ID('dbo.agents','U') IS NULL
BEGIN
CREATE TABLE dbo.agents (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
	is_active BIT NOT NULL DEFAULT 1
);
END
GO

-- Checklists (um por data)
IF OBJECT_ID('dbo.checklists','U') IS NULL
BEGIN
CREATE TABLE dbo.checklists (
    id INT IDENTITY(1,1) PRIMARY KEY,
    check_date DATE NOT NULL UNIQUE,
    saved_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
END
GO

-- Itens do checklist
IF OBJECT_ID('dbo.checklist_items','U') IS NULL
BEGIN
CREATE TABLE dbo.checklist_items (
    id INT IDENTITY(1,1) PRIMARY KEY,
    checklist_id INT NOT NULL REFERENCES dbo.checklists(id) ON DELETE CASCADE,
    system_id INT NULL REFERENCES dbo.systems(id),
	agent_id INT NULL REFERENCES dbo.agents(id),
    status NVARCHAR(50) NOT NULL,
    note NVARCHAR(1000) NULL,
    last_check NVARCHAR(200) NULL
);
END
GO


-- Insere sistemas padrão (se tabela vazia)
IF NOT EXISTS (SELECT 1 FROM dbo.systems)
BEGIN
    INSERT INTO dbo.systems (name) VALUES
    (N'ERP (Produção)'),
    (N'ERP (Simulação)')
END
GO

-- Insere agentes padrão (se tabela vazia)
IF NOT EXISTS (SELECT 1 FROM dbo.agents)
BEGIN
    INSERT INTO dbo.agents (name) VALUES
    (N'Administrador'),
    (N'Maikon Lopes')
END
GO

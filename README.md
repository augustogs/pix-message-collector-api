# pix-message-collector-api

## Instruções sobre como configurar e rodar a aplicação.

## Requisitos

- **Node.js (npm) e PostgreSQL** instalados.

## Configuração

### 1. Clonar o Repositório

Primeiro, clone o repositório para sua máquina local:

```sh
git clone https://github.com/augustogs/pix-message-collector-api
```

### 2. Configurar a aplicação

#### Acesse a pasta raiz do repositório e instale as depedências

```sh
npm install
```

### Configure o banco de dados Postgre

- Abra o terminal e acesse o shell do PostgreSQL usando o comando:

```sh
psql -U postgres
```
- Crie o banco de dados com o nome `db` ou o nome de sua preferência. Caso use outro nome, lembre-se de ajustar a variável `PGDATABASE` no arquivo `.env`:

```
CREATE DATABASE 'nome_database';
```

- Altere a senha padrão do usuário postgres:
```
ALTER USER postgres PASSWORD 'nova_senha';
```
- #### Certifique-se de que o arquivo .env está presente na pasta raiz do projeto e as variáveis `PGUSER`, `PGPASSWORD` e `PGDATABASE` reflerem o usuário, senha e nome do banco de dados que você criou. 

```
PORT=3000
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=senha_database
PGDATABASE=db
PGPORT=5432

DATABASE_URL="postgresql://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}?schema=public"

```

#### Abra o terminal na raiz do projeto e execute as migrations para a criação das tabelas no banco de dados:

```
npx prisma migrate deploy
```

## 3. Execute a aplicação
Após a instalação de dependências e criação do banco de dados, execute o comando para inicialização da aplicação:

```
npm run dev
```

A aplicação deverá estar sendo executada no caminho `http://localhost:3000`.


## 4. Endpoints

### Gerar mensagens pix aleatórias
#### Endpoint: `POST /api/util/msgs/{ispb}/{number}`
---
### Recuperar mensagens pix recebidas pelo ispb
#### Endpoint: `GET /api/pix/{ispb}/stream/start`
#### Headers: `application/json | multipart/json`
---
### Recuperar mensagens pix recebidas pelo ispb e interationId
#### Endpoint: `GET /api/pix/{ispb}/stream/{interationId}`
#### Headers: `application/json | multipart/json`
---
### Interromper o recebimento de mensagens
**Endpoint:** `DELETE /api/pix/{ispb}/stream/{interationId}`
---

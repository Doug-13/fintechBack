# FINTECH Backend — Express + MongoDB + Object Storage (S3 compatible)

Pronto para rodar com **MongoDB Atlas** e **Object Storage** (AWS S3 / MinIO / Wasabi etc.).
Inclui:
- Autenticação JWT
- Multi-tenant básico (Organização + Membership com módulos/permissões por usuário)
- Planos e Assinaturas (modelos base)
- Upload com **pré-assinado** e **multipart server-side**
- Preferências do usuário (tema/idioma) e foto de perfil
- Logo da empresa salva no Object Storage

## Rotas Principais

### Auth
- `POST /auth/register` — `{ email, name, password }`
- `POST /auth/login` — `{ email, password }`

### Usuário
- `GET /users/me`
- `PATCH /users/me` — `{ name?, photoUrl?, preferences? }`

### Organizações
- `POST /organizations` — `{ name, slug }` (cria e dá acesso ao criador)
- `GET /organizations` — organizações do usuário logado
- `PATCH /organizations/:id` — para setar `logoUrl` após upload

### Uploads (Object Storage)
- `POST /uploads/presign` — body: `{ filename, contentType, folder? }` → retorna `uploadUrl`, `key` e `publicUrl?`
- `POST /uploads/multipart?folder=logos` — multipart form field: `file`

## Como rodar

```bash
cp .env.example .env
# edite as variáveis (MongoDB Atlas, S3, etc.)

npm install
npm run dev
# http://localhost:4000/health
```

### Dicas de S3
- Para **MinIO** local, use `S3_ENDPOINT=http://localhost:9000` e `S3_FORCE_PATH_STYLE=true`.
- Configure `S3_PUBLIC_BASE_URL` se usar CDN; caso contrário, use a URL retornada pelo provedor.

## Fluxo recomendado para fotos e logos
1. Cliente chama `POST /uploads/presign` com `filename` e `contentType`.
2. Faz `PUT` direto na URL retornada (`uploadUrl`) com o arquivo.
3. Salva a URL pública (`publicUrl` ou `S3_PUBLIC_BASE_URL + '/' + key`) no `PATCH /users/me` ou `PATCH /organizations/:id`.

## Licença
MIT

# Documentação: Modelo de Usuário (User Model)

## Visão Geral
Este arquivo é responsável por definir a estrutura de dados (Schema) e os comportamentos (Métodos/Middlewares) da entidade `User` no banco de dados MongoDB, utilizando o Mongoose. Ele também gerencia a segurança das senhas e o controle de sessões ativas através de *Refresh Tokens*.

## Dependências
* **mongoose**: Biblioteca ODM (Object Data Modeling) usada para modelar os dados e interagir com o MongoDB.
* **bcryptjs**: Biblioteca utilizada para criar *hashes* criptográficos das senhas, garantindo que não sejam salvas em texto plano no banco de dados.

---

## Estrutura dos Esquemas (Schemas)

### 1. `refreshTokenSchema`
Este é um subdocumento (schema embutido) usado para gerenciar as sessões do usuário.
* **Por que foi criado?** Para permitir a rotação de *Refresh Tokens* e controle de múltiplos dispositivos logados.
* **Campos:**
  * `token`: A string do token em si.
  * `family`: Identificador da família do token (útil para detectar reuso malicioso e invalidar cadeias de tokens).
  * `expiredAt`: Data de expiração da sessão.
  * `createdByIp` / `userAgent`: Rastreamento de onde o login foi feito (útil para auditoria e segurança).
* **Configuração Especial:** `{ _id: false }` evita que o MongoDB crie um ID único para cada token dentro do array, economizando espaço e processamento, já que o próprio token já atua como identificador.

### 2. `userSchema`
O esquema principal que representa o usuário no sistema.
* **Campos Principais:**
  * `name`, `email`, `username`: Dados básicos de identificação. O email é forçado a ser `lowercase` e `unique` (único no sistema).
  * `passwordHash`: Armazena a senha criptografada. A opção `select: false` é uma camada extra de segurança que impede que a senha seja retornada acidentalmente em consultas normais ao banco.
  * `role`: Define o nível de permissão (Padrão: `customer`).
  * `isActive`: Flag para "soft delete" ou banimento temporário.
  * `refreshTokens`: Array que armazena as sessões ativas (baseado no `refreshTokenSchema`). Possui um validador que **limita o usuário a no máximo 3 sessões simultâneas**.
  * `passwordChangedAt`: Registra quando a senha foi alterada pela última vez (útil para invalidar tokens antigos após uma troca de senha).
* **Configuração Especial:** `{ timestamps: true }` instrui o Mongoose a criar e gerenciar automaticamente os campos `createdAt` e `updatedAt`.

---

## Middlewares (Hooks)

### `pre('save')`
Um interceptador que roda automaticamente **antes** de o documento ser salvo no banco de dados.
* **Como funciona:**
  1. Verifica se a senha foi modificada (`this.isModified('passwordHash')`). Se não foi (ex: o usuário só atualizou o nome), ele pula para a próxima ação.
  2. Se a senha foi alterada, ela é criptografada usando o `bcrypt` com um fator de custo de `15`. *(Nota de desempenho: o custo 15 é bastante seguro, mas exige mais processamento da CPU. Se o login estiver muito lento, considere reduzir para 10 ou 12).*
  3. Define o `passwordChangedAt` subtraindo 1 segundo (1000ms) do tempo atual. **Por que?** Isso compensa pequenos atrasos de rede ou processamento, garantindo que o timestamp de mudança de senha seja sempre ligeiramente anterior à criação de um novo token JWT após o login.

---

## Métodos de Instância

Estes métodos ficam disponíveis em qualquer documento (objeto) de usuário retornado pelo banco.

* **`comparePassword(candidate)`**
  * **Para que serve:** Recebe uma senha em texto plano digitada no login e compara com o *hash* salvo no banco.
  * **Retorno:** Booleano (true se a senha estiver correta).

* **`checkIfActive()`**
  * **Para que serve:** Retorna rapidamente se a conta do usuário está ativa. Útil em middlewares de autorização.

* **`toJSON()`**
  * **Para que serve:** Sobrescreve o comportamento padrão de quando o documento Mongoose é convertido para JSON (o que acontece automaticamente ao enviar uma resposta com `res.json(user)` no Express/Fastify).
  * **Como funciona:** Ele cria uma cópia do objeto e deleta dados sensíveis ou internos (`passwordHash`, `refreshTokens`, `__v`), garantindo que o front-end receba apenas os dados seguros e necessários.

---

## Exportação
* **`User`**: O modelo final compilado pelo Mongoose, pronto para ser importado em controladores e repositórios para executar operações de CRUD (Create, Read, Update, Delete).
# Documentação Técnica — category.js (Modelo de Categoria com Mongoose)

## Objetivo

Este arquivo define o modelo **Category** utilizando o Mongoose, responsável por estruturar categorias e subcategorias em um sistema (ex: e-commerce), bem como regras de validação, serialização, campos virtuais e organização hierárquica.

---

## 1. Importação do Mongoose

```js
import mongoose from 'mongoose'
```

* **mongoose** é uma biblioteca ODM (Object Data Modeling) que facilita o mapeamento de documentos MongoDB para objetos Node.js, além de fornecer middlewares e validações.

---

## 2. categorySchema — Definição Estrutural da Categoria

```js
const categorySchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true, unique: true},
    slug: {type: String, unique: true, lowercase: true},
    parent: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null},
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: {virtuals: true}, toObject: {virtuals: true}}
);
```

**Campos:**
- `name`: Nome da categoria, obrigatório, único, sem espaços extras nas bordas.
- `slug`: Versão amigável para URLs, única, minúscula, gerada automaticamente a partir do nome.
- `parent`: Referência para outra categoria (auto-relacionamento), permitindo hierarquia (subcategorias).
- `isActive`: Booleano para ativar/desativar a categoria sem removê-la do banco.

**Opções Especiais:**
- `timestamps`: Cria e atualiza automaticamente os campos `createdAt` e `updatedAt`.
- `toJSON`, `toObject` com `{ virtuals: true }`: Ao serializar a categoria (para enviar ao frontend, por exemplo), campos virtuais também são incluídos.

---

## 3. Middleware (pre-validate) — Validação e Slug

```js
categorySchema.pre('validate', function (next){
    if (this.parent && this.parent.equals(this._id)){
        next(new Error('Uma categoria não pode ser sua própria categoria pai!'))
    }
    if (this.isModified('name')){
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\s-]/g, '');
    }
    next();
});
```

**O que faz:**
- Antes de validar ou salvar, impede que uma categoria seja ela mesma seu próprio pai (referência circular direta).
- Gera (ou atualiza) o `slug` sempre que o nome é modificado:  
  - converte para minúsculo,  
  - remove espaços extras,  
  - transforma espaços internos em hífen,  
  - elimina caracteres especiais.

---

## 4. Serialização Personalizada (toJSON)

```js
categorySchema.set('toJSON', {
    transform: function (doc,ret){
        delete ret.__v;
        return ret;
    }
});
```

**Descrição:**  
Ao converter para JSON, remove o campo interno `__v` (de versionamento do documento), não útil para o frontend.

---

## 5. Virtuals

### 5.1. Virtual `isSubCategory`

```js
categorySchema.virtual('isSubCategory').get(function(){ 
    return this.parent !== null; 
});
```

**Para que serve:**  
- Retorna `true` se a categoria possui um parent, ou seja, se é uma subcategoria.  
- Retorna `false` se for uma categoria de topo.

---

## 6. Exportação do Modelo

```js
export const Category = mongoose.model('Category',categorySchema);
```

**Descrição:**  
Compila o schema no modelo `Category`, pronto para uso em controladores e serviços para criar, buscar, atualizar e deletar categorias.

---
*/
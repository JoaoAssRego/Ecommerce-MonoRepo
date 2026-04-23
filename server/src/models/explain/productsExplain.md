# Documentação Técnica — products.js (Modelo de Produto com Mongoose)

## Objetivo

Este arquivo define o modelo **Product** utilizando o Mongoose, um ODM (Object Data Modeling) para MongoDB em aplicações Node.js. Ele estrutura os dados, validações, middlewares, índices e regras de serialização relacionadas a produtos do sistema.

---

## 1. Importação do Mongoose

```js
import mongoose from 'mongoose'
```

O Mongoose é importado para possibilitar a definição dos Schemas, criação dos modelos e interação com o MongoDB.

---

## 2. imageSchema — Subdocumento de Imagem

```js
const imageSchema = new mongoose.Schema({
    url: {type: String, required: true},
    publicId: {type: String, required: true},
    alt: {type: String, default: ''},
    isPrimary: {type: Boolean, default: false}
}, {_id: false});
```

**Descrição:**  
Representa uma imagem associada ao produto.

- `url`: Endereço da imagem (obrigatório).
- `publicId`: Identificador público único da imagem (obrigatório).
- `alt`: Texto alternativo.
- `isPrimary`: Define se esta é a imagem principal do produto.

> `_id: false`: Não cria um ObjectId para cada imagem, já que o identificador único não é necessário neste contexto.

---

## 3. variantSchema — Subdocumento de Variante

```js
const variantSchema = new mongoose.Schema({
    sku: {type: String, required: true},
    attributes: {type: Map, of: String},
    priceInCents: {type: Number, required: true, min: 0},
    stock: {type: Number, required: true, min: 0, default: 0},
    discountPriceInCents: {
        type: Number,
        validate: { validator: function(val) { return val <= this.priceInCents; }, message: "The discount can't be higher than Price" },
        default: 0
    }
}, {_id: true});
```

**Descrição:**  
Cada produto pode ter várias variantes (por exemplo, tamanhos, cores).

- `sku`: Código de referência único da variante.
- `attributes`: Atributos dinâmicos (exemplo: cor, tamanho).
- `priceInCents`: Preço base em centavos (mínimo 0).
- `stock`: Quantidade em estoque.
- `discountPriceInCents`: Preço promocional; não pode ser maior que o preço base.

> Validação extra garante que o desconto nunca exceda o preço base.

---

## 4. productSchema — Esquema Principal do Produto

```js
const productSchema = new mongoose.Schema({
    title: {type: String, required: true},
    slug: {type: String, unique: true, lowercase: true},
    description: {type: String, required: true},
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true},
    images: {type: [imageSchema], required: true, validate: { validator: function(val) { return val.length <= 10; }, message: "You can't put 10 images from one product" } },
    variants: {type: [variantSchema], required: true},
    basePriceInCents: {type: Number, required: true, min: 0}
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });
```

**Principais campos:**

- `title`: Nome do produto (obrigatório).
- `slug`: Identificador único "amigável para URLs", gerado automaticamente.
- `description`: Descrição do produto (obrigatória).
- `category`: Referência à categoria do produto (relacionamento com Schema Category).
- `images`: Array de imagens (máx. 10 por produto).
- `variants`: Array de variantes do produto.
- `basePriceInCents`: Preço base (em centavos, obrigatório).

> As opções `timestamps`, `toJSON` e `toObject` habilitam controles automáticos de datas e a serialização de virtuals.

---

## 5. Middleware (pre-validate) — Geração de Slug

```js
productSchema.pre('validate', function(next) {
    if (this.title){
        this.slug = this.title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-').replace(/[^\w\s-]/g, '');
    }
    next();
});
```

**Função:**  
Antes da validação, o slug é gerado a partir do título do produto:  
- letras minúsculas,  
- espaços em branco convertidos em hífens,  
- caracteres especiais removidos.

---

## 6. Índices

```js
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ slug: 1 });
```

**Objetivo:**  
- Buscar produtos por título ou descrição.
- Garantir unicidade e performance em buscas por slug.

---

## 7. Virtuals

### 7.1. Virtual `isOutOfStock`

```js
productSchema.virtual('isOutOfStock').get(function() {
    return this.variants.reduce((acc, variant) => acc + variant.stock, 0) === 0;
});
```

**Descrição:**  
Informa rapidamente se qualquer variante do produto tem estoque. Retorna `true` se todas estiverem zeradas.

---

## 8. Serialização Personalizada (toJSON)

```js
productSchema.set('toJSON', {
    transform: function (doc,ret){
        ret.variants = ret.variants.map(variant => {
            const v = {...variant}
            delete v.stock
            delete v.__v
            return v;
        })
        delete ret.__v
        return ret;
    }
});
```

**Descrição:**  
Ao converter um produto para JSON (ex: enviar resposta para frontend):

- Remove o campo `__v` (versão do documento).
- Remove o campo `stock` e `__v` de cada variante, reduzindo dados sensíveis ou internos.

---

## 9. Exportação do Modelo

```js
export const Product = mongoose.model('Product', productSchema);
```

**Descrição:**  
Exporta o modelo Product, pronto para operações CRUD e uso em controladores e repositórios.

---
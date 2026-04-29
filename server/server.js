import { connectDB } from './src/config/db.js'
import product_route from './src/routes/api/products.js'
import errorhandler from './src/middleware/errorHandler.js'
import express from 'express'
import 'dotenv/config'

connectDB();

const app = express();

const PORT = process.env.PORT || 5000

app.use(express.json()) // Transforma tudo que o express recebe em JSON

app.use("/api/products",product_route); // Recebe o caminho de rotas de produtos

app.use(errorHandler); // Tratamento de erros

app.listen(PORT,() => {
    console.log("Aplicação rodando!");
}  );
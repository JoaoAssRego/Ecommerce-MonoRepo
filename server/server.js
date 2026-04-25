import { connectDB } from './src/config/db.js'
import express from 'express'
import 'dotenv/config'

connectDB();

const app = express();

const PORT = process.env.PORT || 5000

app.listen(PORT,() => {
    console.log("Aplicação rodando!");
}  );
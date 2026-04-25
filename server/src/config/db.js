import 'dotenv/config';
import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
        
    }
    catch (error){
        console.error("Não foi possível conectar ao Banco de dados!")
        process.exit(1);
    }
    
};

mongoose.connection.on('error', (err) => {
    console.error(`Erro após conexão inicial: ${err}`);
});
import 'dotenv/config';
import mongoose from 'mongoose'

export const connectDB = async () => {
    try {
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            maxPoolSize: 10, // pool de conexões para ambiente serverless
          })
    }
    catch (error){
        console.error("Não foi possível conectar ao Banco de dados!");
        // Esta é a linha de ouro do debugging:
        console.error("O motivo exato é:", error.message); 
        process.exit(1);
    }
};

mongoose.connection.on('error', (err) => {
    console.error(`Erro após conexão inicial: ${err}`);
});
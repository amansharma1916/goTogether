import express from 'express';
import cors from 'cors';
import connectDB from './DB/db.js';
import authRoutes from './Auth/Routes/authRoutes.js';
import rideRoutes from './routes/rideRoutes.js';


const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors(
    {origin: '*'}
));
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Hello, World!');
})

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
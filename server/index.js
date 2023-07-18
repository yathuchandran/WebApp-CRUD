import express from "express";
import connectDB from "./config/db.js";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 9000;
connectDB();

app.use(express.static( 'public'));
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Backend is Running...");
});

//Routes
app.use('/api/auth', userRoute);
app.use('/api/adminAuth', adminRoute);

app.listen(PORT, () => {
  console.log(`API is Running on http://localhost:${PORT}`);
});

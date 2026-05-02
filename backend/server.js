import app from './src/app.js';
import connectToDatabase from './src/db/db.js';

connectToDatabase();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
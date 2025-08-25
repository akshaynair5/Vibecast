import dbConnect from './db/index.js';
import { app } from './app.js';

dbConnect()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on PORT: ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
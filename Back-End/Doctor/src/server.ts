import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Doctor server running on port ${PORT}`));

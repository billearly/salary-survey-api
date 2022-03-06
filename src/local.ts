import { app } from "./app";
import { connectDb } from "./persistence";

const port = process.env.PORT_LOCAL || 3000;

app.listen(port, () => {
  connectDb();
  console.log(`API ready at http://localhost:${port}`);
});

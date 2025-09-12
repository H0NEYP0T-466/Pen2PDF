const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { generateRES } = require('./controller/controller');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload()); // ✅ enable file uploads

app.get('/', (req, res) => {
  console.log("Frontend call received at backend");
  res.send('Hello World!');
});

app.post('/textExtract', generateRES);

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
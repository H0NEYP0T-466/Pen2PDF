const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { generateRES } = require('./controller/controller');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload()); 

app.get('/', (req, res) => {
  console.log("Frontend call received at backend");
  res.send('Hello World!');
});

app.post('/textExtract', generateRES);

mongoose.connect('mongodb://127.0.0.1:27017/todolist')
  .then(() => {
    console.log('MongoDB connected');
    app.listen(8000, () => console.log('Server running on port 8000'));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

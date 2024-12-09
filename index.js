const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const port = process.env.PORT || parseInt(process.argv[2], 10) || 9001;

const app = express();

async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error(`Error reading the file at ${filePath}:`, err);
    throw err;
  }
}

// Using res.writeHeader + res.write + res.end to send

app.get('/', (req, res) => {
	res.writeHeader(200, {'Content-Type': 'text/html'});
	res.write('<h1>This is my Express Server</h1>');
	res.end();
  });
app.get('/api/team', async (req, res) => {
  try {
    const data = await readFile('team.html');
    res.writeHeader(200, { 'Content-Type': 'text/html' });
    res.write(data);  
    res.end();
  } catch (err) {
    res.writeHeader(500, { 'Content-Type': 'text/html' });
    res.write('<h1>Internal Server Error</h1>');
    res.end();
  }
});


// Using res.sendFile to send a static file
app.get('/express', (req, res) => {
  const filePath = path.join(__dirname, 'express.html');
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(500).send('<h1>Internal Server Error</h1>');
    }
  });
});

// Using res.status().send()
app.get('/nima', (req, res) => {
  res.status(200).send('<h1>Hi Nima</h1>');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

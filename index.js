const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const validator = require('validator');
const {body, validationResult } = require('express-validator');
const Joy = require('joi');
const port = process.env.PORT || parseInt(process.argv[2], 10) || 9001;

const app = express();
app.use(express.json());

function validateTeamMember(member) {
	const schema = Joy.object({
		name: Joy.string().min(3).required(),
	});
	return schema.validate(member);
	// return Joy.validate(member, schema); old version
}



async function readFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return data;
  } catch (err) {
    console.error(`Error reading the file at ${filePath}:`, err);
    throw err;
  }
}


async function loadTeam() {
  try {
	const data = await readFile('team.json');
	return JSON.parse(data);
  } catch (err) {
	console.error('Error loading team:', err);
	return [];
  }
}

async function writeFile(filePath, data) {
	  try {
	await fs.writeFile(filePath, data);
	  }
	  catch (err) {
	console.error(`Error writing to the file at ${filePath}:`, err);
	  };};

async function saveTeam() {
  try {
	await writeFile('team.json', JSON.stringify(team, null, 2));
  } catch (err) {
	console.error('Error saving team:', err);
  }
}

let team = [];
loadTeam().then((data) => {
	team = data;
});


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

app.get('/api/team/:id', (req, res) => {
	// res.status(200).send(`<h1>Team Member ${req.params.id} is ${team.filter(member => member.id == req.params.id)[0].name}
	// 	</h1>`);
	const member = team.find(member => member.id == parseInt(req.params.id));
	if (!member) {
		res.status(404).send(`<h1>Team Member ${req.params.id} not found</h1>`);
		return;
	}
	res.status(200).send(`<h1>Team Member ${req.params.id} is ${member.name}
		</h1>`);
});

app.get('/api/team/:id/:name', (req, res) => {
	res.status(200).send(req.params);
});


//http://localhost:9000/query?sortBy=name
app.get('/query', (req, res) => {
	res.status(200).send(req.query);
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






app.post('/api/team',
	[
		body('name').isAlpha().withMessage('from Express valid. Name must contain only letters'),
	],
	 (req, res) => {
	
	if (!req.body.name) {
		if(req.accepts('html')) {
			return res.status(400).send('<h1>Name is required</h1>');
		}
		else {
			return res.status(400).send('Name is required');
		}
	};
	if (req.body.name.length < 3) {
		if (req.accepts('html')) {
			return res.status(400).send('<h1>Name must be at least 3 characters</h1>');
		}
		else {
			return res.status(400).send('Name must be at least 3 characters');
		}
	};

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		if (req.accepts('html')) {
			return res.status(400).send(`<h1>${errors.array()[0].msg}</h1>`);
		}
		else {
			return res.status(400).send(errors.array()[0].msg);
		}
	}






	if(!validator.isAlpha(req.body.name)) {
		if (req.accepts('html')) {
			return res.status(400).send('<h1>Name must contain only letters</h1>');
		}
		else {
			return res.status(400).send('Name must contain only letters');
		}
	};


	const member = {
		id: team.length + 1,
		name: req.body.name
	};

	team.push(member);
	saveTeam();
	res.status(201).send(member);
});


app.put('/api/team/:id', (req, res) => {
	const member = team.find(member => member.id == parseInt(req.params.id));
	if (!member) {
		res.status(404).send(`<h1>Team Member ${req.params.id} not found</h1>`);
		return;
	}

	// const result = validateTeamMember(req.body);
	// if (result.error) {
	// 	res.status(400).send(result.error.details[0].message);
	// 	return;
	// }
	//instead of the above 3 lines, we can use the following 2 lines by oject destructuring


	const {error} = validateTeamMember(req.body);
	if (error) {
		res.status(400).send(error.details[0].message);
		return;
	};
	member.name = req.body.name;
	saveTeam();
	res.status(200).send(member);
});

app.delete('/api/team/:id', (req, res) => {
	const member = team.find(member => member.id == parseInt(req.params.id));
	if (!member) {
		return res.status(404).send(`<h1>Team Member ${req.params.id} not found</h1>`);
	}
	const index = team.indexOf(member);
	team.splice(index, 1);
	saveTeam();
	res.status(200).send(member);
});








app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

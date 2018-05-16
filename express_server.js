const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

var urlDatabase = {
	b2xVn2: 'http://www.lighthouselabs.ca',
	'9sm5xk': 'http://www.google.com',
};

function generateRandomString() {
	return Math.random()
		.toString(36)
		.substring(7);
}

app.get('/', (req, res) => {
	res.end('Hello!');
});

app.get('/urls', (req, res) => {
	let templateVars = { urls: urlDatabase };
	res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
	res.render('urls_new');
});

app.post('/urls', (req, res) => {
	const errors = [];
	const shortURL = generateRandomString();
	urlDatabase[shortURL] = req.body.longURL;
	res.redirect('/urls/' + shortURL);
});

app.get('/urls/:id', (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		urls: urlDatabase,
	};
	res.render('urls_new', templateVars);
});

app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});

app.get('/u/:shortURL', (req, res) => {
	let shortURL = req.params.shortURL;
	let longURL = urlDatabase[shortURL];

	if (longURL === undefined) {
		res.sendStatus(404);
	}
	res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
	const id = req.params.id;
	const longurlToDelete = urlDatabase[id];
	if (longurlToDelete) {
		delete urlDatabase[id];
	}

	res.redirect('/urls');
});

app.get('/urls/:id/edit', (req, res) => {
	const id = req.params.id;
	const longURL = urlDatabase[id];

	let templateVars = {
		shortURL: id,
		urls: urlDatabase,
	};

	res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
	const id = req.params.id;

	console.log(id);
	urlDatabase[id] = req.body.longURL;

	res.redirect('/urls');
});

app.get('/hello', (req, res) => {
	res.end(`<html><body>Hello <b>World</b></body></html>\n`);
});
app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
	b2xVn2: 'http://www.lighthouselabs.ca',
	'9sm5xk': 'http://www.google.com',
};

const users = {
	userRandomID: {
		id: 'userRandomID',
		email: 'user@example.com',
		password: 'purple-monkey-dinosaur',
	},
	user2RandomID: {
		id: 'user2RandomID',
		email: 'user2@example.com',
		password: 'dishwasher-funk',
	},
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
	let templateVars = {
		urls: urlDatabase,
		users: users[req.cookies.user_id],
	};
	res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
	let templateVars = {
		users: users[req.cookies.user_id],
	};
	res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => {
	const shortURL = generateRandomString();
	urlDatabase[shortURL] = req.body.longURL;

	let templateVars = {
		users: users[req.cookies.user_id],
	};

	res.redirect('/urls/' + shortURL);
});

app.get('/urls/:id', (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		urls: urlDatabase,
		users: users[req.cookies.user_id],
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
	//const longURL = urlDatabase[id];

	let templateVars = {
		shortURL: id,
		urls: urlDatabase,
		users: users[req.cookies.user_id],
	};

	res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
	const id = req.params.id;

	console.log(id);
	urlDatabase[id] = req.body.longURL;

	res.redirect('/urls/');
});

app.get('/hello', (req, res) => {
	res.end(`<html><body>Hello <b>World</b></body></html>\n`);
});

function checkUser(email, password) {
	for (id in users) {
		const user = users[id];
		if (user.email == email && user.password == password) {
			return true;
		}
	}
	return false;
}

app.post('/login', (req, res) => {
	const login_email = req.body.email;
	const login_password = req.body.password;

	function returnID(email) {
		for (id in users) {
			var user = users[id];
			if (user.email == email) {
				return user.id;
			}
		}
	}

	if (checkUser(login_email, login_password)) {
		res.cookie('user_id', returnID(login_email));
		res.redirect('/urls');
	} else {
		res.status(403).send('wrong email or password');
	}
});

app.post('/logout', (req, res) => {
	const user_id = req.cookies['user_id'];
	res.clearCookie('user_id', user_id);
	res.redirect('/urls');
});

app.get('/register', (req, res) => {
	res.render('urls_register');
});

function checkEmail(email) {
	for (id in users) {
		var user = users[id];
		if (user.email === email) {
			return true;
		}
	}
	return false;
}

app.post('/register', (req, res) => {
	const newUserId = generateRandomString();
	const email = req.body.email;
	const password = req.body.password;

	if (email === '' || password === '') {
		res.status(400).send('Please enter a email and/or password');
	}

	if (checkEmail(email)) {
		res.status(400).send('email is already registered');
	}

	users[newUserId] = {
		id: newUserId,
		email: email,
		password: password,
	};

	res.cookie('user_id', users[newUserId].id);
	res.redirect('/urls');
});

app.get('/login', (req, res) => {
	//	const user_id = req.cookies['user_id'];
	res.render('urls_login');
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

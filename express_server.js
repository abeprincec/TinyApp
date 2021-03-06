const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const PORT = process.env.PORT || 8080;

const app = express();

app.use(
	cookieSession({
		name: 'session',
		keys: ['secret'],

		// Cookie Options
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
	})
);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());

const urlDatabase = {
	b2xVn2: {
		shortURL: 'b2xVn2',
		longURL: 'http://www.lighthouselabs.ca',
		userId: 'userRandomID',
	},
	'9sm5xk': {
		shortURL: '9sm5xk',
		longURL: 'http://www.google.com',
		userId: 'user2RandomID',
	},
};

const users = {
	userRandomID: {
		id: 'userRandomID',
		email: 'user@example.com',
		password: bcrypt.hashSync('purple-monkey-dinosaur', 10),
	},
	user2RandomID: {
		id: 'user2RandomID',
		email: 'user2@example.com',
		password: bcrypt.hashSync('dishwasher-funk', 10),
	},
	user3: {
		id: 'user3',
		email: 'ab@gmail.com',
		password: bcrypt.hashSync('123', 10),
	},
};

function generateRandomString() {
	return Math.random()
		.toString(36)
		.substring(7);
}

//home page
app.get('/', (req, res) => {
	if (res.session) {
		res.redirect('/urls');
	}
	res.render('urls_login');
});

//urls page
app.get('/urls', (req, res) => {
	let templateVars = {
		urls: urlDatabase,
		users: users[req.session.user_id],
	};
	res.render('urls_index', templateVars);
});

//create new short urls
app.get('/urls/new', (req, res) => {
	if (req.session.user_id == undefined) {
		res.redirect('/login');
	}
	let templateVars = {
		users: users[req.session.user_id],
	};
	res.render('urls_new', templateVars);
});
//generate short URL
app.post('/urls', (req, res) => {
	const shortURL = generateRandomString();
	urlDatabase[shortURL] = {
		shortURL: shortURL,
		longURL: req.body.longURL,
		userId: req.session.user_id,
	};

	let templateVars = {
		users: users[req.session.user_id],
	};

	res.redirect('/urls/' + shortURL);
});

//go to page to enter long URL
app.get('/urls/:id', (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		urls: urlDatabase[req.params.id],
		users: users[req.session.user_id],
	};
	res.render('urls_new', templateVars);
});
//show url database object
app.get('/urls.json', (req, res) => {
	res.json(urlDatabase);
});
//go to shorted URL
app.get('/u/:shortURL', (req, res) => {
	let shortURL = req.params.shortURL;
	let longURL = urlDatabase[shortURL].longURL;

	if (longURL === undefined) {
		res.sendStatus(404);
	}
	res.redirect(longURL);
});
//delete url
app.post('/urls/:id/delete', (req, res) => {
	const id = req.params.id;
	const longurlToDelete = urlDatabase[id];
	if (urlDatabase[id].userId !== req.session.user_id) {
		res.status(401).send('Not your URL');
		return;
	}
	if (longurlToDelete) {
		delete urlDatabase[id];
	}
	res.redirect('/urls');
});
//edit URLs
app.get('/urls/:id/edit', (req, res) => {
	const id = req.params.id;

	if (urlDatabase[id].userId !== req.session.user_id) {
		res.status(401).send('Not your URL');
		return;
	}

	let templateVars = {
		shortURL: id,
		urls: urlDatabase,
		users: users[req.session.user_id],
	};

	res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
	const id = req.params.id;
	if (urlDatabase[id].userId !== req.session.user_id) {
		res.status(401).send('Not your URL');
		return;
	}
	urlDatabase[id].longURL = req.body.longURL;
	res.redirect('/urls/');
});

app.get('/hello', (req, res) => {
	res.end(`<html><body>Hello <b>World</b></body></html>\n`);
});

//check login info
function checkClearLogin(username, password) {
	for (let user in users) {
		if (
			users[user].email === username &&
			bcrypt.compareSync(password, users[user].password)
		) {
			return true;
		}
	}
}
//return ID for session
function returnID(email) {
	for (let user in users) {
		if (users[user].email === email) {
			return users[user].id;
		}
	}
}

app.post('/login', (req, res) => {
	const login_email = req.body.email;
	const login_password = req.body.password;
	const user = checkClearLogin(login_email, login_password);
	if (user) {
		req.session.user_id = returnID(login_email);
		res.redirect('/urls');
	} else {
		res.status(403).send('wrong email or password');
	}
});

app.post('/logout', (req, res) => {
	req.session = null;
	res.redirect('/');
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
	const hashedPassword = bcrypt.hashSync(password, 10);
	users[newUserId] = {
		id: newUserId,
		email: email,
		password: hashedPassword,
	};

	//res.session('user_id', users[newUserId].id);
	req.session.user_id = users[newUserId].id;
	res.redirect('/urls');
});

app.get('/login', (req, res) => {
	//	const user_id = req.cookies['user_id'];
	res.render('urls_login');
});

app.listen(PORT, () => {
	console.log(`Example app listening on port ${PORT}!`);
});

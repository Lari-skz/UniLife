const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Servește fișierele din același director

// MongoDB Atlas connection
const db = 'mongodb+srv://oviwansan:1234@unilife.hhsrc.mongodb.net/?retryWrites=true&w=majority&appName=UniLife';
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    city: String,
    facultate: String
});

const User = mongoose.model('User', UserSchema);

// Routes
app.post('/signup', async (req, res) => {
    const { username, email, password, confirm_password, city, facultate } = req.body;
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const newUser = new User({ username, email, password, city, facultate });
        await newUser.save();
        res.status(201).redirect('/login.html');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.status(200).send(`
                <script>
                    sessionStorage.setItem('username', '${username}');
                    window.location.href = '/index.html';
                </script>
            `);
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));



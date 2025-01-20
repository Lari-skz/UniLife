const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Servește fișierele din același director
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servește directorul uploads

// MongoDB Atlas connection
const db = process.env.MONGODB_URI || 'mongodb+srv://oviwansan:1234@unilife.hhsrc.mongodb.net/UniLife?retryWrites=true&w=majority&appName=UniLife';
mongoose.connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000 // 30 seconds timeout
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.error('MongoDB connection error:', err));

// Set storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    city: String,
    facultate: String,
    profileImage: String // Adăugare câmp pentru URL-ul imaginii
});

const User = mongoose.model('User', UserSchema);

// Signup Route
app.post('/signup', upload.single('profileImage'), async (req, res) => {
    const { username, email, password, confirm_password, city, facultate } = req.body;
    if (password !== confirm_password) {
        return res.status(400).send('Passwords do not match');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            city,
            facultate,
            profileImage: req.file ? `/uploads/${req.file.filename}` : ''
        });
        await newUser.save();
        res.status(201).redirect('/login.html');
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login request received with username:', username);
    try {
        const user = await User.findOne({ username });
        if (user) {
            console.log('User found:', user.username);
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                console.log('Password match');
                res.status(200).send(`
                    <script>
                        sessionStorage.setItem('username', '${user.username}');
                        sessionStorage.setItem('email', '${user.email}');
                        sessionStorage.setItem('city', '${user.city}');
                        sessionStorage.setItem('profileImage', '${user.profileImage}');
                        window.location.href = '/index.html';
                    </script>
                `);
            } else {
                console.log('Invalid password');
                res.status(401).send('Invalid credentials');
            }
        } else {
            console.log('User not found');
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).send('Server error');
    }
});

// Profile Image Upload Route
app.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ username });
        if (user) {
            user.profileImage = `/uploads/${req.file.filename}`;
            await user.save();
            res.status(200).send(`
                <script>
                    sessionStorage.setItem('profileImage', '${user.profileImage}');
                    window.location.href = '/profile.html';
                </script>
            `);
        } else {
            res.status(401).send('User not found');
        }
    } catch (err) {
        console.error('Profile image upload error:', err);
        res.status(500).send('Server error');
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('An error occurred:', err.stack);
    res.status(500).send('Something went wrong! We are working to fix it.');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

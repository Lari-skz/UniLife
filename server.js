const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const bcrypt = require('bcrypt');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Servește fișierele din același director
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Servește directorul uploads
app.get('/post-job.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'post-job.html'));
});


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

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'unilifeinfo3@gmail.com',
        pass: 'xgqb edeq vaqt jmbm'
    }
});


// Job Schema
const JobSchema = new mongoose.Schema({
    description: { type: String, maxlength: 500 },
    phone: String,
    email: String,
    createdAt: { type: Date, default: Date.now }
});

const Job = mongoose.model('Job', JobSchema);


// Post Job Route
app.post('/post-job', async (req, res) => {
    const { description, phone, email } = req.body;
    try {
        const newJob = new Job({
            description,
            phone,
            email
        });
        await newJob.save();
        res.status(201).send('Job posted');
    } catch (err) {
        console.error('Error posting job:', err);
        res.status(500).send('Server error');
    }
});


// Get Jobs Route
app.get('/get-jobs', async (req, res) => {
    try {
        const jobs = await Job.find();
        res.status(200).json(jobs);
    } catch (err) {
        console.error('Error fetching jobs:', err);
        res.status(500).send('Server error');
    }
});




// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    city: String,
    facultate: String,
    profileImage: String, // Adăugare câmp pentru URL-ul imaginii
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

const User = mongoose.model('User', UserSchema);

// Event Schema
const EventSchema = new mongoose.Schema({
    title: String,
    start: Date,
    end: Date,
    description: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Event = mongoose.model('Event', EventSchema);

// Task Schema
const TaskSchema = new mongoose.Schema({
    text: String,
    completed: Boolean,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Task = mongoose.model('Task', TaskSchema);


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
                        sessionStorage.setItem('userId', '${user._id}');
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

// Send Reset Password Email Route
app.post('/send-reset-password-email', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send('No account with that email address exists.');
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        const resetURL = `http://${req.headers.host}/reset-password.html?token=${token}`;

        const mailOptions = {
            from: 'youremail@gmail.com',
            to: email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                  `Please click on the following link, or paste this into your browser to complete the process:\n\n` +
                  `${resetURL}\n\n` +
                  `If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error('Error sending email:', error);
        return res.json({ success: false, error: error.message });
    }
    console.log('Email sent:', info.response);
    res.json({ success: true });
});

    } catch (err) {
        console.error('Error in email route:', err);
        res.status(500).send('Server error');
    }
});

// Change Password Route
app.post('/change-password', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send('Password reset token is invalid or has expired.');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();
        res.status(200).send('Password changed');
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).send('Server error');
    }
});

// Save Event Route
app.post('/save-event', async (req, res) => {
    const { title, start, end, description, userId } = req.body;
    
    try {
        const newEvent = new Event({
            title,
            start,
            end,
            description,
            user: userId
        });
        await newEvent.save();
        res.status(201).send('Event saved');
    } catch (err) {
        console.error('Error saving event:', err);
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


// Fetch Events Route
app.get('/get-events', async (req, res) => {
    const { userId, date } = req.query;
    
    try {
        const events = await Event.find({
            user: userId,
            start: { $lte: new Date(date).setHours(23, 59, 59, 999) },
            end: { $gte: new Date(date).setHours(0, 0, 0, 0) }
        });
        res.status(200).json(events);
    } catch (err) {
        console.error('Error fetching events:', err);
        res.status(500).send('Server error');
    }
});

// Fetch All Events Route
app.get('/get-all-events', async (req, res) => {
    const { userId, month, year } = req.query;
    
    try {
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0);

        const events = await Event.find({
            user: userId,
            start: { $lte: endOfMonth },
            end: { $gte: startOfMonth }
        });
        res.status(200).json(events);
    } catch (err) {
        console.error('Error fetching all events:', err);
        res.status(500).send('Server error');
    }
});

// Delete Event Route
app.delete('/delete-event', async (req, res) => {
    const { eventId } = req.query;
    
    try {
        await Event.findByIdAndDelete(eventId);
        res.status(200).send('Event deleted');
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).send('Server error');
    }
});

// Save Task Route
app.post('/save-task', async (req, res) => {
    const { text, completed, userId } = req.body;

    try {
        const newTask = new Task({
            text,
            completed,
            user: userId
        });
        await newTask.save();
        res.status(201).send('Task saved');
    } catch (err) {
        console.error('Error saving task:', err);
        res.status(500).send('Server error');
    }
});

// Fetch Tasks Route
app.get('/get-tasks', async (req, res) => {
    const { userId } = req.query;

    try {
        const tasks = await Task.find({ user: userId });
        res.status(200).json(tasks);
    } catch (err) {
        console.error('Error fetching tasks:', err);
        res.status(500).send('Server error');
    }
});

// Update Task Route
app.patch('/update-task', async (req, res) => {
    const { taskId, completed } = req.body;

    try {
        await Task.findByIdAndUpdate(taskId, { completed });
        res.status(200).send('Task updated');
    } catch (err) {
        console.error('Error updating task:', err);
        res.status(500).send('Server error');
    }
});

// Delete Task Route
app.delete('/delete-task', async (req, res) => {
    const { taskId } = req.query;

    try {
        await Task.findByIdAndDelete(taskId);
        res.status(200).send('Task deleted');
    } catch (err) {
        console.error('Error deleting task:', err);
        res.status(500).send('Server error');
    }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('An error occurred:', err.stack);
    res.status(500).send('Something went wrong! We are working to fix it.');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

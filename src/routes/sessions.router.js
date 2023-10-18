import { Router } from 'express';
import userModel from '../DATA/mongoDB/models/user.model.js';
import passport from 'passport';
import bcrypt from 'bcrypt';
import config from '../config.js';
import UsersDto from '../DATA/DTOs/users.dto.js';

const router = Router();

router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;

    const exist = await userModel.findOne({ email });

    if (exist) {
        return res.status(400).send({ status: "error", error: "User already exists" });
    }

    const user = {
        first_name, last_name, email, age, password
    };

    const result = await userModel.create(user);
    res.send({ status: "success", message: "User registered successfully" });
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).send({ status: "error", error: "Incorrect data" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid && password === user.password) {
    } else if (!isPasswordValid) {
        return res.status(400).send({ status: "error", error: "Incorrect data" });
    }

    if (email === config.adminEmail && password === config.adminPassword) {
        user.role = 'ADMIN';
    }
    req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role: user.role,
    }
    res.redirect('/api/views/products');
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ status: "error", error: "Could not log out" })
        res.redirect('/login');
    })
})

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })
router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = req.user
    res.redirect('/profile')
})

router.get('/current', (req, res) => {
    const userDto = new UsersDto(req.session.user);
    res.status(200).json({ user: userDto });
});

export default router;
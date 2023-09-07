import { Router } from 'express';
import userModel from '../db/models/user.model.js';

const router = Router();

router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;

    const exist = await userModel.findOne({ email });

    if (exist) {
        return res.status(400).send({ status: "error", error: "The user already exists" });
    }

    const user = {
        first_name, last_name, email, age, password
    };

    const result = await userModel.create(user);
    res.send({ status: "success", message: "User registered successfully" });
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email, password })

    if (!user) {
        return res.status(400).send({ status: "error", error: "Incorrect credentials" })
    }
    // Validation for ADMIN user as specified in the deliverable slides
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        user.role = 'ADMIN';
    }

    req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role: user.role, // Adding user role to the session
    }

    res.redirect('/api/views/products');
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ status: "error", error: "Could not log out" })
        res.redirect('/login');
    })
})

export default router;
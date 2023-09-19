import { Router } from 'express';
import userModel from '../db/models/user.model.js';
import passport from 'passport';
// import { hashData } from '../utils.js';
import bcrypt from 'bcrypt';

const router = Router();

router.post('/register', async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;

    const exists = await userModel.findOne({ email });

    if (exists) {
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

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).send({ status: "error", error: "Incorrect data" })
    }

    // Verify the password entered by the user against the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    // If the password doesn't match, check if it's the unhashed password 
    if (!isPasswordValid && password === user.password) {

    } else if (!isPasswordValid) {
        return res.status(400).send({ status: "error", error: "Incorrect data" });
    }

    // Validation for the ADMIN user as indicated in the deliverables slides
    if (email === 'adminCoder@coder.com' && password === 'adminCod3r123') {
        user.role = 'ADMIN';
    }

    req.session.user = {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        age: user.age,
        role: user.role, 
    }

    //res.send({status:"success", payload:req.res.user, message:"Welcome"})
    res.redirect('/api/views/products');
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send({ status: "error", error: "Could not log out" })
        res.redirect('/login');
    })
})

// Calling GitHub for redirection and for the callback

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { })

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = req.user
    res.redirect('/profile')
})

export default router;
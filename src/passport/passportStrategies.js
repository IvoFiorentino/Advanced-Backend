import passport from "passport"
import  userModel from '../db/models/user.model.js'
import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as GithubStrategy } from 'passport-github2'
import { compareData } from "../utils.js"
import { usersManager } from "../DAL/usersManager.js"

// User => Serialize
passport.serializeUser((user, done) => {
    done(null, user._id)
})

// ID => User
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id)
        done(null, user)
    } catch (error) {
        done(error)
    }
})

// Local Strategy
passport.use('login', new LocalStrategy(
    async function (username, password, done) {
        try {
            const userDB = await usersManager.findUser(username)
            if (!userDB) {
                return done(null, false)
            }
            const isPasswordValid = await compareData(password, userDB.password)
            if (!isPasswordValid) {
                return done(null, false)
            }
            return done(null, userDB)
        } catch (error) {
            done(error)
        }
    }
))

//Github Strategy    
passport.use('github', new GithubStrategy({
    clientID: '98b7f9797c99115a817e',
    clientSecret: 'db55a0604f27fcfe9ac693861e52f3c8674308e4',
    callbackURL: 'http://localhost:8080/api/session/githubcallback',
},
async function(accessToken, refreshToken, profile, done){
    try {
        // Check if the GitHub user exists, and if so, log in.
        const userExists = await usersManager.findUser(profile.username);
        if (userExists) {
            return done(null, userExists);
        }
        // If the user doesn't exist, create it.
        const newUser = {
            first_name: profile.displayName,
            last_name: profile.displayName,
            username: profile.username,
            password: ' ',
            fromGithub: true, // Indicates that this user comes from GitHub
        }
        const result = await usersManager.create(newUser)
        return done (null, result)
    } catch (error) {
        done(error)
    }
}
))
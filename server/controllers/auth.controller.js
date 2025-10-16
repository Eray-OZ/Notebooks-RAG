import User from '../models/User.model.js'
import jwt from 'jsonwebtoken'
import config from '../config/index.js'


const generateToken = (id) => {
    return jwt.sign({ id }, config.jwtSecret, { expiresIn: '30d' })
}

export const registerUser = async (req, res, next) => {
    const { username, email, password } = req.body

    try {
        const userExist = await User.findOne({ email })

        if (userExist) {
            res.status(400)
            throw new Error("This email already used")
        }

        const user = await User.create({ username, email, password })

        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            })
        }

    } catch (error) {
        next(error)
    }
}




export const loginUser = async (req, res, next) => {
    const { email, password } = req.body

    try {
        if (!email || !password) {
            res.status(400)
            throw new Error('Please provide email and password')
        }

        const user = await User.findOne({ email }).select('+password')

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            })
        }
        else {
            res.status(401)
            throw new Error('Unvalid email or password')
        }

    } catch (error) {
        next(error)
    }
}
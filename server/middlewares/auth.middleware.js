import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import config from '../config/index.js'


export const protect = async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {

            token = req.headers.authorization.split(' ')[1]
            console.log("Token from header:", token);
            console.log("JWT Secret from config:", config.jwtSecret);
            const decoded = jwt.verify(token, config.jwtSecret)

            console.log("Decoded token:", decoded);

            req.user = await User.findById(decoded.id).select('-password')

            console.log("User from DB:", req.user);

            next()
        } catch (error) {
            console.error(error)
            res.status(401).json({ message: 'Not authorized, token failed' })
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' })
    }
}

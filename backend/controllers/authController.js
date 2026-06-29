import User from "../models/User.js";
import jwt from "jsonwebtoken";
import UserPreference from "../models/UserPreference.js";


/**
 * Generate JWT token
 */
const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Register new user
 */
export const register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, password and name fields'
            });
        }

        const existingUser = await User.findByEmail(email);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const user = await User.create(email, password, name);

        // Default preferences
        await UserPreference.upsert(user.id, {
            dietary_restrictions: [],
            allergies: [],
            preferred_cuisines: [],
            default_servings: 4,
            measurement_unit: 'metric'
        });


        const token = generateToken(user);
        res.status(200).json({
            success: true,
            message: "User Registered Successfully",
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {

    try {
        const { email, password } = req.body;

        //Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password fields'
            });
        }

        // Find User By Email
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found with this email'
            });
        }

        // Verify Password
        const isPasswordValid = await User.verifyPassword(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Generate Token
        const token = generateToken(user);
        
        res.status(200).json({
            success: true,
            message: "User Logged In Successfully",
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name
                }
            }
        });
    } catch (error) {
        next(error)
    }

}

/**
 * Get Current Logged In User
 */
export const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {user}
        });

    } catch (error) {
        next(error);
    }
}

/**
 * Request Password Reset (place holder for now - would require email services or OTP in production)
 */

export const requestPasswordReset = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        const user = await User.findByEmail(email);

        //Do not reveal user found/not found status for security reasons

        res.status(200).json({
            success: true,
            message: 'If a account with this email exists, a password reset link has been sent.'
        });

    } catch (error) {
        next(error);
    }
}
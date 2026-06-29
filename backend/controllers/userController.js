import User from "../models/User.js";
import UserPreference from "../models/UserPreference.js";


/**
 * Get User Profile
 */
export const getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const preferences = await UserPreference.findByUserId(req.user.id);


        res.status(200).json({
            success: true,
            data: { user, preferences }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update User Profile
 */

export const updateProfile = async (req, res, next) => {
    try {
        const {name, email} = req.body;

        const user = await User.update(req.user.id, {name, email});


        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {user}
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update User Preferences
 */

export const updatePreferences = async (req, res, next) => {
    try {
        const preferences = await UserPreference.upsert(req.user.id, req.body);        
        
        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: {preferences}
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Change Password
 */

export const changePassword = async (req, res, next) => {
    try {
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword){
            return res.status(400).json({
                success: false,
                message: 'Please provide current password and new password fields'
            });
        }

        // Verify User
        const user = await User.findById(req.user.id);
        const isValid = await User.verifyPassword(currentPassword, user.password_hash);
        

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid current password'
            });
        }

        await user.updatePassword(req.user.id, newPassword);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete User Account
 */  

export const deleteAccount = async (req, res, next) => {
    try{
        await User.delete(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully',
        });
    }catch(error){
        next(error);
    }
};



    


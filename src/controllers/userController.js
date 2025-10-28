import bcrypt from 'bcryptjs';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken'
import cloudinary from '../lib/cloudinary.js'

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "15d" })
}

export const register = async (req, res) => {
    try {
        const { username, email, address, location, role, password } = req.body;

        // Validate required fields
        if (!username || !email || !address || !location || !role || !password) {
            return res.status(400).json({
                message: 'All fields are required',
                success: false,
                error: true,
            });
        }

        // Check if user already exists
        const userExist = await userModel.findOne({ email });
        if (userExist) {
            return res.status(400).json({
                message: 'User already exists',
                success: false,
                error: true,
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new userModel({
            username,
            email,
            address,
            location,
            role,
            password: hashedPassword,
        });

        const savedUser = await newUser.save();

        const accessToken = generateAccessToken(savedUser._id)

        return res.status(201).json({
            message: 'Account created successfully',
            success: true,
            error: false,
            data: {
                savedUser,
                accessToken
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Something went wrong',
            success: false,
            error: true,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                message: 'All fields are required',
                success: false,
                error: true,
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).json({
                message: 'Invalid credentials',
                success: false,
                error: true,
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials',
                success: false,
                error: true,
            });
        }

        // Generate access token
        const accessToken = generateAccessToken(user._id);

        // Remove password before sending response
        user.password = undefined;

        return res.status(200).json({
            message: 'logged in successful',
            success: true,
            error: false,
            data: {
                user,
                accessToken,
            },
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Something went wrong',
            success: false,
            error: true,
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Clear the access token cookie
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        return res.status(200).json({
            message: 'Logged out successfully',
            success: true,
            error: false,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Something went wrong',
            success: false,
            error: true,
        });
    }
};

export const profile = async (req, res) => {
    try {
        const { avatar } = req.body

        const upload = await cloudinary.uploader.upload(avatar, {
            folder: 'hustleMoja/profiles'
        })
        if (!upload) {
            return res.status(400).json({
                message: 'image upload failed',
                success: false,
                error: true
            })
        }

        const avatarUrl = upload.secure_url;
        const newAvatar = new userModel({
            avatar: avatarUrl
        })
        await newAvatar.save()

        return res.status(201).json({
            message: 'profile uploaded successfully',
            success: true,
            error: false
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Something went wrong',
            success: false,
            error: true,
        });
    }
}

export const update = async (req, res) => {
    try {
        const userId = res.user
        const { username, email, mobile, password, location, address, bio } = req.body

        let hashPassword = '';

        if (password) {
            const salt = await bcrypt.genSalt(10)
            hashPassword = await bcrypt.hash(password, salt)
        }

        const updateUser = await userModel.updateOne({ _id: userId }, {
            ...(username && { username: username }),
            ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            ...(location && { location: location }),
            ...(address && { address: address }),
            ...(bio && { bio: bio })
        })

        return res.json({
            message: 'Updated successfully',
            error: false,
            success: true,
            data: updateUser
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Something went wrong',
            success: false,
            error: true,
        });
    }
}

export const details = async (req, res) => {
    try {
        const userId = req.user
        const user = await userModel.findById(userId)

        return res.json({
            message: 'user details',
            data: user,
            error: false,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "something went wrong",
            success: false,
            error: true
        })
    }
}

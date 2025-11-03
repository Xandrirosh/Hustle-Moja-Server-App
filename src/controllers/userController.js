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
        const userId = req.user._id
        const buffer = req.file?.buffer

        if (!buffer) {
            return res.status(400).json({
                message: 'No image file received',
                success: false,
                error: true,
            })
        }

        const stream = cloudinary.uploader.upload_stream(
            { folder: 'hustleMoja/profiles' },
            async (error, result) => {
                if (error || !result?.secure_url) {
                    return res.status(400).json({
                        message: 'Image upload failed',
                        success: false,
                        error: true,
                    })
                }

                const avatarUrl = result.secure_url
                const profile = await userModel.findByIdAndUpdate(userId, { avatar: avatarUrl }, { new: true })

                return res.status(201).json({
                    message: 'Profile uploaded successfully',
                    success: true,
                    error: false,
                    data: profile,
                })
            }
        )

        stream.end(buffer)
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Something went wrong',
            success: false,
            error: true,
        })
    }
}

export const update = async (req, res) => {
    try {
        const userId = req.user._id
        const { username, email, mobile, bio } = req.body

        const updateUser = await userModel.findByIdAndUpdate(userId, {
            ...(username && { username: username }),
            ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            ...(bio && { bio: bio })
        }, { new: true })

        return res.json({
            message: 'Updated successfully',
            error: false,
            success: true,
            data: updateUser
        });

    } catch (error) {
        console.error('Update error:', error); // ✅ log full error
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

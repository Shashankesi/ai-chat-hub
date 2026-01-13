import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    // Handle avatar upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'pulsechat/avatars');
      updates.avatar = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

// @desc    Update privacy settings
// @route   PUT /api/users/privacy
export const updatePrivacySettings = async (req, res) => {
  try {
    const { showOnlineStatus, showLastSeen, readReceipts, hiddenFrom } = req.body;

    const updates = {};

    if (showOnlineStatus) updates['privacySettings.showOnlineStatus'] = showOnlineStatus;
    if (showLastSeen) updates['privacySettings.showLastSeen'] = showLastSeen;
    if (readReceipts !== undefined) updates['privacySettings.readReceipts'] = readReceipts;
    if (hiddenFrom) updates['privacySettings.hiddenFrom'] = hiddenFrom;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during privacy settings update'
    });
  }
};

// @desc    Toggle focus mode
// @route   PUT /api/users/focus-mode
export const toggleFocusMode = async (req, res) => {
  try {
    const { isActive, allowedContacts, autoReply, schedule } = req.body;

    const updates = {};

    if (isActive !== undefined) updates['focusMode.isActive'] = isActive;
    if (allowedContacts) updates['focusMode.allowedContacts'] = allowedContacts;
    if (autoReply) updates['focusMode.autoReply'] = autoReply;
    if (schedule) updates['focusMode.schedule'] = schedule;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Focus mode updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Toggle focus mode error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during focus mode update'
    });
  }
};

// @desc    Search users
// @route   GET /api/users/search
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('name email avatar bio isOnline lastSeen').limit(20);

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user search'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:userId
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name email avatar bio isOnline lastSeen');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

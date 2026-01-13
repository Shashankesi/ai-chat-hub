import Chat from '../models/Chat.js';
import Message from '../models/Message.js';

// @desc    Create or get one-to-one chat
// @route   POST /api/chats
export const createChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      isGroup: false,
      'members.user': { $all: [req.user._id, userId] }
    }).populate('members.user', 'name email avatar isOnline lastSeen')
      .populate('lastMessage');

    if (existingChat) {
      return res.json({
        success: true,
        data: { chat: existingChat }
      });
    }

    // Create new chat
    const chat = await Chat.create({
      isGroup: false,
      members: [
        { user: req.user._id, role: 'member' },
        { user: userId, role: 'member' }
      ]
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('members.user', 'name email avatar isOnline lastSeen');

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat: populatedChat }
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during chat creation'
    });
  }
};

// @desc    Create group chat
// @route   POST /api/chats/group
export const createGroupChat = async (req, res) => {
  try {
    const { name, memberIds, description } = req.body;

    if (!name || !memberIds || memberIds.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Group name and at least 2 members are required'
      });
    }

    // Create members array with creator as admin
    const members = [
      { user: req.user._id, role: 'admin' },
      ...memberIds.map(id => ({ user: id, role: 'member' }))
    ];

    const chat = await Chat.create({
      name,
      isGroup: true,
      members,
      description
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('members.user', 'name email avatar isOnline lastSeen');

    res.status(201).json({
      success: true,
      message: 'Group created successfully',
      data: { chat: populatedChat }
    });
  } catch (error) {
    console.error('Create group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during group creation'
    });
  }
};

// @desc    Get all user chats
// @route   GET /api/chats
export const getChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      'members.user': req.user._id
    })
      .populate('members.user', 'name email avatar isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name avatar'
        }
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single chat
// @route   GET /api/chats/:chatId
export const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('members.user', 'name email avatar isOnline lastSeen')
      .populate('pinnedMessages');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is member
    const isMember = chat.members.some(
      m => m.user._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { chat }
    });
  } catch (error) {
    console.error('Get chat by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update group chat
// @route   PUT /api/chats/:chatId
export const updateGroupChat = async (req, res) => {
  try {
    const { name, description, avatar } = req.body;

    const chat = await Chat.findById(req.params.chatId);

    if (!chat || !chat.isGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }

    // Check if user is admin
    const member = chat.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update group details'
      });
    }

    const updates = {};
    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (avatar) updates.avatar = avatar;

    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      updates,
      { new: true }
    ).populate('members.user', 'name email avatar isOnline lastSeen');

    res.json({
      success: true,
      message: 'Group updated successfully',
      data: { chat: updatedChat }
    });
  } catch (error) {
    console.error('Update group chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add members to group
// @route   POST /api/chats/:chatId/members
export const addGroupMembers = async (req, res) => {
  try {
    const { memberIds } = req.body;

    const chat = await Chat.findById(req.params.chatId);

    if (!chat || !chat.isGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }

    // Check if user is admin or moderator
    const member = chat.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || !['admin', 'moderator'].includes(member.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only admins and moderators can add members'
      });
    }

    // Add new members
    const newMembers = memberIds.map(id => ({
      user: id,
      role: 'member'
    }));

    chat.members.push(...newMembers);
    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('members.user', 'name email avatar isOnline lastSeen');

    res.json({
      success: true,
      message: 'Members added successfully',
      data: { chat: updatedChat }
    });
  } catch (error) {
    console.error('Add group members error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/chats/:chatId/members/:userId
export const removeGroupMember = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat || !chat.isGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }

    // Check if user is admin
    const member = chat.members.find(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove members'
      });
    }

    // Remove member
    chat.members = chat.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await chat.save();

    const updatedChat = await Chat.findById(chat._id)
      .populate('members.user', 'name email avatar isOnline lastSeen');

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: { chat: updatedChat }
    });
  } catch (error) {
    console.error('Remove group member error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update expiry rules
// @route   PUT /api/chats/:chatId/expiry
export const updateExpiryRules = async (req, res) => {
  try {
    const { enabled, duration, deleteAfterSeen } = req.body;

    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      {
        expiryRules: {
          enabled,
          duration,
          deleteAfterSeen
        }
      },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    res.json({
      success: true,
      message: 'Expiry rules updated successfully',
      data: { chat }
    });
  } catch (error) {
    console.error('Update expiry rules error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create poll in group
// @route   POST /api/chats/:chatId/polls
export const createPoll = async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;

    const chat = await Chat.findById(req.params.chatId);

    if (!chat || !chat.isGroup) {
      return res.status(404).json({
        success: false,
        message: 'Group chat not found'
      });
    }

    const poll = {
      question,
      options: options.map(opt => ({ text: opt, votes: [] })),
      createdBy: req.user._id,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    };

    chat.polls.push(poll);
    await chat.save();

    res.json({
      success: true,
      message: 'Poll created successfully',
      data: { poll: chat.polls[chat.polls.length - 1] }
    });
  } catch (error) {
    console.error('Create poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Vote on poll
// @route   POST /api/chats/:chatId/polls/:pollId/vote
export const votePoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    const poll = chat.polls.id(req.params.pollId);

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: 'Poll not found'
      });
    }

    // Remove previous vote if exists
    poll.options.forEach(opt => {
      opt.votes = opt.votes.filter(
        v => v.toString() !== req.user._id.toString()
      );
    });

    // Add new vote
    poll.options[optionIndex].votes.push(req.user._id);

    await chat.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      data: { poll }
    });
  } catch (error) {
    console.error('Vote poll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

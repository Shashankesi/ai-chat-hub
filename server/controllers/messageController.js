import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import {
  generateSmartReplies,
  detectMessageIntent,
  detectImportantMessage,
  summarizeConversation
} from '../utils/ai.js';

// @desc    Send message
// @route   POST /api/messages
export const sendMessage = async (req, res) => {
  try {
    const { chatId, text, replyTo } = req.body;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is member
    const isMember = chat.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create message
    const messageData = {
      chat: chatId,
      sender: req.user._id,
      content: { text },
      type: 'text',
      replyTo
    };

    // Handle media upload
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'pulsechat/media');
      messageData.content.mediaUrl = result.secure_url;

      if (req.file.mimetype.startsWith('image')) {
        messageData.type = 'image';
      } else if (req.file.mimetype.startsWith('video')) {
        messageData.type = 'video';
      } else if (req.file.mimetype.startsWith('audio')) {
        messageData.type = 'voice';
      }
    }

    // Set expiry if chat has expiry rules
    if (chat.expiryRules?.enabled && chat.expiryRules.duration) {
      messageData.expiresAt = new Date(Date.now() + chat.expiryRules.duration);
    }

    const message = await Message.create(messageData);

    // AI Processing (async, don't block response)
    if (text && text.length > 10) {
      Promise.all([
        generateSmartReplies(text),
        detectMessageIntent(text),
        detectImportantMessage(text)
      ]).then(([smartReplies, intent, isImportant]) => {
        Message.findByIdAndUpdate(message._id, {
          'aiFeatures.smartReplies': smartReplies,
          'aiFeatures.detectedIntent': intent.intent,
          'aiFeatures.extractedData': intent,
          'aiFeatures.isImportant': isImportant
        }).catch(err => console.error('AI processing error:', err));
      }).catch(err => console.error('AI processing error:', err));
    }

    // Update chat's last message
    chat.lastMessage = message._id;
    await chat.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('replyTo');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: populatedMessage }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during message sending'
    });
  }
};

// @desc    Get chat messages
// @route   GET /api/messages/:chatId
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;

    const messages = await Message.find({
      chat: chatId,
      isDeleted: false,
      deletedFor: { $ne: req.user._id }
    })
      .populate('sender', 'name avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Message.countDocuments({
      chat: chatId,
      isDeleted: false,
      deletedFor: { $ne: req.user._id }
    });

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:messageId
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { deleteForEveryone } = req.body;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (deleteForEveryone) {
      // Only sender can delete for everyone
      if (message.sender.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Only sender can delete message for everyone'
        });
      }

      message.isDeleted = true;
      message.content = { text: 'This message was deleted' };
    } else {
      // Delete for self
      message.deletedFor.push(req.user._id);
    }

    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Pin/Unpin message
// @route   PUT /api/messages/:messageId/pin
export const togglePinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const chat = await Chat.findById(message.chat);

    message.isPinned = !message.isPinned;

    if (message.isPinned) {
      message.pinnedBy = req.user._id;
      chat.pinnedMessages.push(message._id);
    } else {
      message.pinnedBy = null;
      chat.pinnedMessages = chat.pinnedMessages.filter(
        id => id.toString() !== messageId
      );
    }

    await message.save();
    await chat.save();

    res.json({
      success: true,
      message: message.isPinned ? 'Message pinned' : 'Message unpinned',
      data: { message }
    });
  } catch (error) {
    console.error('Toggle pin message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Mark messages as seen
// @route   PUT /api/messages/:chatId/seen
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { chatId } = req.params;

    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        'seenBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          seenBy: {
            user: req.user._id,
            seenAt: new Date()
          }
        },
        $set: { status: 'seen' }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as seen'
    });
  } catch (error) {
    console.error('Mark messages as seen error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search messages
// @route   GET /api/messages/search
export const searchMessages = async (req, res) => {
  try {
    const { query, chatId, fromDate, toDate, mediaType } = req.query;

    const searchCriteria = {
      deletedFor: { $ne: req.user._id },
      isDeleted: false
    };

    if (query) {
      searchCriteria.$text = { $search: query };
    }

    if (chatId) {
      searchCriteria.chat = chatId;
    } else {
      // Search only in user's chats
      const userChats = await Chat.find({
        'members.user': req.user._id
      }).select('_id');

      searchCriteria.chat = { $in: userChats.map(c => c._id) };
    }

    if (fromDate || toDate) {
      searchCriteria.createdAt = {};
      if (fromDate) searchCriteria.createdAt.$gte = new Date(fromDate);
      if (toDate) searchCriteria.createdAt.$lte = new Date(toDate);
    }

    if (mediaType) {
      searchCriteria.type = mediaType;
    }

    const messages = await Message.find(searchCriteria)
      .populate('sender', 'name avatar')
      .populate('chat', 'name isGroup')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get conversation summary
// @route   GET /api/messages/:chatId/summary
export const getConversationSummary = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { messageCount = 50 } = req.query;

    const messages = await Message.find({
      chat: chatId,
      type: 'text',
      isDeleted: false
    })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(messageCount));

    if (messages.length === 0) {
      return res.json({
        success: true,
        data: { summary: 'No messages to summarize' }
      });
    }

    const summary = await summarizeConversation(messages.reverse());

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Get conversation summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

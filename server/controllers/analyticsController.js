import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

// @desc    Get user chat analytics
// @route   GET /api/analytics/dashboard
export const getChatAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all user chats
    const userChats = await Chat.find({
      'members.user': userId
    }).select('_id');

    const chatIds = userChats.map(c => c._id);

    // Total messages sent
    const totalMessagesSent = await Message.countDocuments({
      sender: userId,
      isDeleted: false
    });

    // Total messages received
    const totalMessagesReceived = await Message.countDocuments({
      chat: { $in: chatIds },
      sender: { $ne: userId },
      isDeleted: false
    });

    // Messages by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const messagesByDay = await Message.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: sevenDaysAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Most contacted users
    const mostContactedUsers = await Message.aggregate([
      {
        $match: {
          sender: userId,
          isDeleted: false
        }
      },
      {
        $lookup: {
          from: 'chats',
          localField: 'chat',
          foreignField: '_id',
          as: 'chatData'
        }
      },
      {
        $unwind: '$chatData'
      },
      {
        $match: {
          'chatData.isGroup': false
        }
      },
      {
        $group: {
          _id: '$chat',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'chats',
          localField: '_id',
          foreignField: '_id',
          as: 'chat'
        }
      },
      {
        $unwind: '$chat'
      },
      {
        $lookup: {
          from: 'users',
          localField: 'chat.members.user',
          foreignField: '_id',
          as: 'members'
        }
      }
    ]);

    // Active hours analysis
    const messagesByHour = await Message.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: sevenDaysAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Media messages count
    const mediaMessagesCount = await Message.countDocuments({
      sender: userId,
      type: { $in: ['image', 'video', 'voice'] },
      isDeleted: false
    });

    // Calculate productivity score (0-100)
    const avgMessagesPerDay = totalMessagesSent / 7;
    const productivityScore = Math.min(100, Math.round(
      (avgMessagesPerDay * 10) + // Base score from activity
      (mediaMessagesCount / totalMessagesSent * 20) + // Media usage bonus
      (mostContactedUsers.length * 5) // Network size bonus
    ));

    res.json({
      success: true,
      data: {
        totalMessagesSent,
        totalMessagesReceived,
        totalChats: userChats.length,
        messagesByDay,
        mostContactedUsers: mostContactedUsers.map(item => ({
          chat: item.chat,
          count: item.count,
          otherUser: item.members.find(m => m._id.toString() !== userId.toString())
        })),
        messagesByHour,
        mediaMessagesCount,
        productivityScore,
        avgMessagesPerDay: Math.round(avgMessagesPerDay)
      }
    });
  } catch (error) {
    console.error('Get chat analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get weekly activity report
// @route   GET /api/analytics/weekly-report
export const getWeeklyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Messages sent this week
    const messagesSentThisWeek = await Message.countDocuments({
      sender: userId,
      createdAt: { $gte: sevenDaysAgo },
      isDeleted: false
    });

    // New chats this week
    const newChatsThisWeek = await Chat.countDocuments({
      'members.user': userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    // Important messages detected
    const importantMessages = await Message.countDocuments({
      sender: userId,
      createdAt: { $gte: sevenDaysAgo },
      'aiFeatures.isImportant': true,
      isDeleted: false
    });

    // Most active day
    const messagesByDayDetailed = await Message.aggregate([
      {
        $match: {
          sender: userId,
          createdAt: { $gte: sevenDaysAgo },
          isDeleted: false
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);

    const mostActiveDay = messagesByDayDetailed[0] || { _id: 'N/A', count: 0 };

    res.json({
      success: true,
      data: {
        period: 'Last 7 days',
        messagesSent: messagesSentThisWeek,
        newChats: newChatsThisWeek,
        importantMessages,
        mostActiveDay: {
          date: mostActiveDay._id,
          messageCount: mostActiveDay.count
        }
      }
    });
  } catch (error) {
    console.error('Get weekly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

import Message from '../models/Message.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

// Store active users
const activeUsers = new Map();

export const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.userId);

    // Add user to active users
    activeUsers.set(socket.userId, socket.id);

    // Update user online status
    User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    }).catch(err => console.error('Error updating online status:', err));

    // Broadcast online status to friends
    socket.broadcast.emit('user:online', { userId: socket.userId });

    // Join user's chat rooms
    socket.on('chat:join', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);

        if (!chat) return;

        const isMember = chat.members.some(
          m => m.user.toString() === socket.userId
        );

        if (isMember) {
          socket.join(chatId);
          console.log(`User ${socket.userId} joined chat ${chatId}`);
        }
      } catch (error) {
        console.error('Join chat error:', error);
      }
    });

    // Leave chat room
    socket.on('chat:leave', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // Send message
    socket.on('message:send', async (data) => {
      try {
        const { chatId, text, replyTo } = data;

        const chat = await Chat.findById(chatId);

        if (!chat) {
          return socket.emit('error', { message: 'Chat not found' });
        }

        // Check if user is member
        const isMember = chat.members.some(
          m => m.user.toString() === socket.userId
        );

        if (!isMember) {
          return socket.emit('error', { message: 'Access denied' });
        }

        // Check focus mode for recipients
        for (const member of chat.members) {
          if (member.user.toString() !== socket.userId) {
            const recipient = await User.findById(member.user);

            if (recipient?.focusMode?.isActive) {
              const isAllowed = recipient.focusMode.allowedContacts.some(
                id => id.toString() === socket.userId
              );

              if (!isAllowed && recipient.focusMode.autoReply) {
                // Send auto-reply
                socket.emit('message:auto-reply', {
                  from: recipient._id,
                  text: recipient.focusMode.autoReply
                });
              }
            }
          }
        }

        // Create message
        const messageData = {
          chat: chatId,
          sender: socket.userId,
          content: { text },
          type: 'text',
          replyTo
        };

        // Set expiry if chat has expiry rules
        if (chat.expiryRules?.enabled && chat.expiryRules.duration) {
          messageData.expiresAt = new Date(Date.now() + chat.expiryRules.duration);
        }

        const message = await Message.create(messageData);

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name avatar')
          .populate('replyTo');

        // Update chat's last message
        chat.lastMessage = message._id;
        await chat.save();

        // Emit message to all chat members
        io.to(chatId).emit('message:new', populatedMessage);

        // Send delivery notifications
        const deliveredTo = chat.members
          .filter(m => m.user.toString() !== socket.userId)
          .map(m => ({ user: m.user, deliveredAt: new Date() }));

        await Message.findByIdAndUpdate(message._id, {
          status: 'delivered',
          deliveredTo
        });

        // Notify offline users (would integrate with push notifications)
        chat.members.forEach(member => {
          const memberSocketId = activeUsers.get(member.user.toString());
          if (!memberSocketId && member.user.toString() !== socket.userId) {
            console.log(`User ${member.user} is offline, send push notification`);
            // TODO: Implement push notifications
          }
        });
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing:start', ({ chatId }) => {
      socket.to(chatId).emit('user:typing', {
        userId: socket.userId,
        chatId
      });
    });

    socket.on('typing:stop', ({ chatId }) => {
      socket.to(chatId).emit('user:stop-typing', {
        userId: socket.userId,
        chatId
      });
    });

    // Mark messages as seen
    socket.on('message:seen', async ({ chatId, messageIds }) => {
      try {
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            sender: { $ne: socket.userId },
            'seenBy.user': { $ne: socket.userId }
          },
          {
            $push: {
              seenBy: {
                user: socket.userId,
                seenAt: new Date()
              }
            },
            $set: { status: 'seen' }
          }
        );

        // Notify senders about read receipts
        const messages = await Message.find({ _id: { $in: messageIds } });

        messages.forEach(message => {
          const senderSocketId = activeUsers.get(message.sender.toString());
          if (senderSocketId) {
            io.to(senderSocketId).emit('message:seen-update', {
              messageId: message._id,
              seenBy: socket.userId,
              chatId
            });
          }
        });

        // Check if messages should be deleted after being seen
        const chat = await Chat.findById(chatId);
        if (chat?.expiryRules?.enabled && chat.expiryRules.deleteAfterSeen) {
          const allSeenMessages = await Message.find({
            _id: { $in: messageIds }
          });

          for (const msg of allSeenMessages) {
            const allMembersSeen = chat.members.every(member =>
              msg.seenBy.some(seen => seen.user.toString() === member.user.toString()) ||
              member.user.toString() === msg.sender.toString()
            );

            if (allMembersSeen) {
              await Message.findByIdAndUpdate(msg._id, {
                expiresAt: new Date(Date.now() + 5000) // Delete after 5 seconds
              });
            }
          }
        }
      } catch (error) {
        console.error('Mark as seen error:', error);
      }
    });

    // Voice call events (WebRTC signaling)
    socket.on('call:initiate', ({ chatId, to, signal }) => {
      const recipientSocketId = activeUsers.get(to);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call:incoming', {
          from: socket.userId,
          chatId,
          signal
        });
      }
    });

    socket.on('call:accept', ({ to, signal }) => {
      const callerSocketId = activeUsers.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:accepted', {
          from: socket.userId,
          signal
        });
      }
    });

    socket.on('call:reject', ({ to }) => {
      const callerSocketId = activeUsers.get(to);
      if (callerSocketId) {
        io.to(callerSocketId).emit('call:rejected', {
          from: socket.userId
        });
      }
    });

    socket.on('call:end', ({ to }) => {
      const otherSocketId = activeUsers.get(to);
      if (otherSocketId) {
        io.to(otherSocketId).emit('call:ended', {
          from: socket.userId
        });
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.userId);

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Update user offline status
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date()
        });

        // Broadcast offline status
        socket.broadcast.emit('user:offline', {
          userId: socket.userId,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error updating offline status:', error);
      }
    });
  });
};

export default setupSocketHandlers;

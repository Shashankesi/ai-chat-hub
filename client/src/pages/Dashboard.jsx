import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { chats, activeChat, messages, sendMessage, setActiveChat } = useChat();
  const [messageText, setMessageText] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessage(messageText);
      setMessageText('');
    }
  };

  return (
    <div className="h-screen flex">
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold gradient-text">PulseChat</h2>
          <button onClick={logout} className="text-sm text-gray-600">Logout</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setActiveChat(chat)}
              className="p-4 border-b cursor-pointer hover:bg-gray-50"
            >
              <div className="font-medium">
                {chat.isGroup ? chat.name : 'Chat'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b bg-white">
              <h3 className="font-semibold">Chat</h3>
            </div>
            <div id="chat-messages" className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg._id} className="chat-bubble chat-bubble-sent">
                  {msg.content.text}
                </div>
              ))}
            </div>
            <form onSubmit={handleSend} className="p-4 border-t">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
                className="input w-full"
              />
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            Select a chat
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

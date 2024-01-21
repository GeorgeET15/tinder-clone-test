import { useState } from "react";
import axios from "axios";

const ChatInput = ({
  user,
  clickedUser,
  getUserMessages,
  getClickedUsersMessages,
}) => {
  const [textArea, setTextArea] = useState("");
  const userId = user?.user_id;
  const clickedUserId = clickedUser?.user_id;

  const addMessage = async () => {
    const message = {
      timestamp: new Date().toISOString(),
      from_userId: userId,
      to_userId: clickedUserId,
      message: textArea,
    };

    try {
      await axios.post("http://tinder-clone-test-a0p4.onrender.com/message", {
        message,
      });
      getUserMessages();
      getClickedUsersMessages();
      setTextArea("");
    } catch (error) {
      console.error("Error adding message:", error);
    }
  };

  return (
    <div className="chat-input">
      <textarea
        placeholder="Type your message..."
        value={textArea}
        onChange={(e) => setTextArea(e.target.value)}
      />
      <button className="primary-button" onClick={addMessage}>
        Send
      </button>
    </div>
  );
};

export default ChatInput;

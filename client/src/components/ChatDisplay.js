// ChatDisplay.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Chat from "./Chat";
import ChatInput from "./ChatInput";
import { Skeleton } from "@mui/material";

const ChatDisplay = ({ user, clickedUser }) => {
  const userId = user?.user_id;
  const clickedUserId = clickedUser?.user_id;
  const [usersMessages, setUsersMessages] = useState(null);
  const [clickedUsersMessages, setClickedUsersMessages] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUsersMessages = async () => {
    try {
      const response = await axios.get(
        "https://tinder-clone-test-a0p4.onrender.com/messages",
        {
          params: { userId, correspondingUserId: clickedUserId },
        }
      );
      setUsersMessages(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getClickedUsersMessages = async () => {
    try {
      const response = await axios.get(
        "https://tinder-clone-test-a0p4.onrender.com/messages",
        {
          params: { userId: clickedUserId, correspondingUserId: userId },
        }
      );
      setClickedUsersMessages(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsersMessages();
    getClickedUsersMessages();
  }, []);

  const messages = [];

  usersMessages?.forEach((message) => {
    const formattedMessage = {};
    formattedMessage["name"] = user?.first_name;
    formattedMessage["img"] = user?.url;
    formattedMessage["message"] = message.message;
    formattedMessage["timestamp"] = message.timestamp;
    messages.push(formattedMessage);
  });

  clickedUsersMessages?.forEach((message) => {
    const formattedMessage = {};
    formattedMessage["name"] = clickedUser?.first_name;
    formattedMessage["img"] = clickedUser?.url;
    formattedMessage["message"] = message.message;
    formattedMessage["timestamp"] = message.timestamp;
    messages.push(formattedMessage);
  });

  const descendingOrderMessages = messages?.sort((a, b) =>
    a.timestamp.localeCompare(b.timestamp)
  );

  return (
    <>
      {loading ? (
        // Stylized Skeleton while loading
        <div className="skeleton-container">
          <Skeleton
            variant="rectangular"
            animation="wave"
            height={50}
            style={{ marginBottom: 16 }}
          />
        </div>
      ) : (
        // Chat component once loaded
        <Chat descendingOrderMessages={descendingOrderMessages} />
      )}
      <ChatInput
        user={user}
        clickedUser={clickedUser}
        getUserMessages={getUsersMessages}
        getClickedUsersMessages={getClickedUsersMessages}
      />
    </>
  );
};

export default ChatDisplay;

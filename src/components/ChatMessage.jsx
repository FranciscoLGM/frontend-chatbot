import React from "react";
import PropTypes from "prop-types";
import { Paper, Typography } from "@mui/material";

const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <Paper
      sx={{
        padding: 1.5,
        margin: "5px 0",
        maxWidth: "70%",
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser ? "#d1e7dd" : "#f8d7da",
      }}
    >
      <Typography variant="body1">{message.text}</Typography>
    </Paper>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string.isRequired,
    sender: PropTypes.oneOf(["user", "bot"]).isRequired,
  }).isRequired,
};

export default ChatMessage;

import React from "react";
import PropTypes from "prop-types";
import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <Paper
      sx={{
        padding: 1.5,
        margin: "5px 0",
        maxWidth: "90%",
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser ? "#d1e7dd" : "#f8d7da",
        borderRadius: 2.5,
        color: isUser ? "#0f5132" : "#842029",
      }}
    >
      <Typography variant="body1">{message.text}</Typography>
      {message.options && (
        <List>
          {message.options.map((option, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={option.name}
                secondary={
                  <React.Fragment>
                    <Typography variant="body2" color="text.secondary">
                      {option.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Precio: ${option.price}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

ChatMessage.propTypes = {
  message: PropTypes.shape({
    text: PropTypes.string.isRequired,
    sender: PropTypes.oneOf(["user", "bot"]).isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
      })
    ),
  }).isRequired,
};

export default ChatMessage;

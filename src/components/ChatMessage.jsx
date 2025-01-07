import React from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";

const ChatMessage = ({ message }) => {
  const isUser = message.sender === "user";

  const userBg = "linear-gradient(45deg, #f5f5f5, #e0e0e0)";
  const userText = "#424242";
  const botBg = "linear-gradient(45deg, #7a628c, #4b2c7f)";
  const botText = "#ffffff";

  return (
    <Box
      display="flex"
      justifyContent={isUser ? "flex-end" : "flex-start"}
      mb={2}
      sx={{
        maxWidth: "100%", // Asegurar que el contenedor no exceda el ancho
      }}
    >
      <Paper
        sx={{
          padding: 2,
          maxWidth: "80%", // Ajustar el ancho máximo del mensaje
          background: isUser ? userBg : botBg,
          borderRadius: 2,
          boxShadow: 3,
          color: isUser ? userText : botText,
          wordWrap: "break-word", // Ajustar el texto largo
        }}
      >
        <Typography variant="body1" color="inherit">
          {message.text}
        </Typography>
        {message.options && (
          <List>
            {message.options.map((option, index) => (
              <ListItem key={index} alignItems="flex-start">
                <ListItemText
                  primary={
                    <Typography variant="body1" color="inherit">
                      {option.name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary">
                        {option.description}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Precio: ${option.price}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
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
        price: PropTypes.number.isRequired,
      })
    ),
  }).isRequired,
};

export default ChatMessage;

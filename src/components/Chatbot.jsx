import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Container,
  TextField,
  Typography,
  Box,
  Dialog,
  useTheme,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ChatMessage from "./ChatMessage";
import useChatbot from "../hooks/useChatbot";

const Chatbot = ({ open, onClose }) => {
  const { messages, input, setInput, handleSend, error, loading } =
    useChatbot();
  const chatWindowRef = useRef(null);
  const theme = useTheme();

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleSend(input);
      setInput("");
    }
  };

  // Auto scroll al recibir nuevos mensajes
  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      const isUserNearBottom =
        chatWindow.scrollHeight - chatWindow.scrollTop <=
        chatWindow.clientHeight + 50;
      if (isUserNearBottom) {
        chatWindow.scrollTop = chatWindow.scrollHeight;
      }
    }
  }, [messages]);

  // Auto scroll al cambiar el input
  useEffect(() => {
    const chatWindow = chatWindowRef.current;
    if (chatWindow) {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }
  }, [input]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          position: "fixed",
          bottom: 16,
          right: 16,
          m: 2,
          width: "90%",
          maxWidth: "400px",
          borderRadius: 3,
        },
      }}
    >
      <Container
        sx={{
          p: 2,
          backgroundColor: theme.palette.background.default,
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6" gutterBottom>
            SushiBot
          </Typography>
          <IconButton onClick={onClose} aria-label="cerrar">
            <CloseIcon
              sx={{ fontSize: 30, color: theme.palette.warning.main }}
            />
          </IconButton>
        </Box>
        <Box
          ref={chatWindowRef}
          sx={{
            borderRadius: 2,
            p: 1,
            height: "380px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#f5f5f5",
          }}
        >
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {loading && (
            <Box display="flex" justifyContent="center" my={2}>
              <CircularProgress color="primary" size={24} />
            </Box>
          )}
        </Box>
        {error && <Typography color="error">{error}</Typography>}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", marginTop: theme.spacing(1) }}
        >
          <TextField
            variant="outlined"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un mensaje..."
            sx={{
              backgroundColor: "#ffffff",
              borderRadius: 2,
            }}
          />
          <IconButton
            type="submit"
            color="primary"
            sx={{
              ml: 1,
              color: "#7a628c",
              "&:disabled": {
                color: theme.palette.action.disabled,
              },
            }}
            disabled={!input.trim() || loading}
          >
            <SendIcon sx={{ fontSize: 30 }} />
          </IconButton>
        </form>
      </Container>
    </Dialog>
  );
};

Chatbot.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Chatbot;

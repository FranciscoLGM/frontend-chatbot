import React, { useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Dialog,
  useTheme,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import ChatMessage from "./ChatMessage";
import useChatbot from "../hooks/useChatbot";

const Chatbot = ({ open, onClose }) => {
  const {
    messages,
    input,
    setInput,
    handleSend,
    error,
    loading,
  } = useChatbot();
  const chatWindowRef = useRef(null);
  const theme = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleSend(input);
      setInput("");
    }
  };

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          position: "fixed",
          bottom: 16,
          right: 16,
          margin: theme.spacing(2),
          width: "333px",
          borderRadius: 10,
        },
      }}
    >
      <Container
        style={{
          padding: theme.spacing(2),
          backgroundColor: "#f5f5f5",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>
            Chatbot de Sushi
          </Typography>
          <IconButton onClick={onClose} aria-label="cerrar">
            <CloseIcon
              sx={{ fontSize: 30, color: theme.palette.warning.main }}
            />
          </IconButton>
        </Box>
        <Box
          ref={chatWindowRef}
          style={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            padding: theme.spacing(1),
            height: "380px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
          {loading && <Typography color="primary">Cargando...</Typography>}
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
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginLeft: theme.spacing(1) }}
          >
            <SendIcon sx={{ fontSize: 25 }} />
          </Button>
        </form>
      </Container>
    </Dialog>
  );
};

export default Chatbot;

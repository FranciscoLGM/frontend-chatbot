import React, { useState } from "react";
import PropTypes from "prop-types";
import { Fab } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

const ChatButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Fab
      color="primary"
      aria-label="chat"
      onClick={onClick}
      sx={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 1000,
        width: 64,
        height: 64,
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)", // Ajuste de sombra
        background: "linear-gradient(45deg, #7a628c, #4b2c7f)", // Fondo de gradiente
        color: "#ffffff",
        transform: isHovered ? "scale(1.15)" : "scale(1)", // Animación de escala más suave
        transition: "transform 0.3s ease-in-out", // Transición más suave
        "&:hover": {
          background: "linear-gradient(45deg, #4b2c7f, #7a628c)", // Cambio de color en hover
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ChatIcon sx={{ fontSize: 30 }} /> {/* Aumentar el tamaño del icono */}
    </Fab>
  );
};

ChatButton.propTypes = {
  onClick: PropTypes.func.isRequired, // Validar que onClick sea una función
};

export default ChatButton;

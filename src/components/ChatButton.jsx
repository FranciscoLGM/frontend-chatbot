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
        bottom: 32, // Usar valores de espaciado de Material-UI
        right: 32,
        zIndex: 1000,
        width: 56, // Aumentar el tamaño
        height: 56, // Aumentar el tamaño
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)", // Sombra
        transform: isHovered ? "scale(1.1)" : "scale(1)", // Animación de escala
        transition: "transform 0.2s", // Transición para animación
      }}
      onMouseEnter={() => setIsHovered(true)} // Cambiar estado al pasar el mouse
      onMouseLeave={() => setIsHovered(false)} // Cambiar estado al salir el mouse
    >
      <ChatIcon sx={{ fontSize: 25 }} /> {/* Aumentar el tamaño del icono */}
    </Fab>
  );
};

ChatButton.propTypes = {
  onClick: PropTypes.func.isRequired, // Validar que onClick sea una función
};

export default ChatButton;

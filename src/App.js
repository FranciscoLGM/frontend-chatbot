import React, { useState } from "react";
import Chatbot from "./components/Chatbot";
import ChatButton from "./components/ChatButton";
import { CssBaseline } from "@mui/material";

const App = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <CssBaseline />
      <Chatbot open={open} onClose={handleClose} />
      {!open && <ChatButton onClick={handleOpen} />}{" "}
    </>
  );
};

export default App;

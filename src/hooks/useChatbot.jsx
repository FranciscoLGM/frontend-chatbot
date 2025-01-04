import { useState, useCallback } from "react";
import axios from "axios";

const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = useCallback(async (message) => {
    if (!message.trim()) return;

    const userMessage = { text: message, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message,
      });

      if (response.data && response.data.answer) {
        const botMessage = { text: response.data.answer, sender: "bot" };
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } else {
        throw new Error("Respuesta inesperada del servidor");
      }
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setError(
        error.response?.data?.message ||
          "No se pudo enviar el mensaje. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }

    setInput("");
  }, []);

  return {
    messages,
    input,
    setInput,
    handleSend,
    error,
    loading,
  };
};

export default useChatbot;

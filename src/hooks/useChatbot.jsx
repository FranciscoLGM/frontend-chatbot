import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const useChatbot = () => {
  const [messages, setMessages] = useState([
    { text: "¡Bienvenido al chat! ¿En qué puedo ayudarte hoy?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [menu, setMenu] = useState([]);
  const [orderDetails, setOrderDetails] = useState({
    name: "",
    quantity: null,
    price: null, // Añadir precio aquí
    customerName: "",
    customerContact: "",
    customerAddress: "",
  });

  // Obtener el menú cuando el componente se monta
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/menu")
      .then((response) => {
        if (response.data) {
          setMenu(response.data.menu);
        }
      })
      .catch((error) => {
        console.error("Error al obtener el menú:", error);
      });
  }, []);

  // Efecto para enviar el pedido al backend
  useEffect(() => {
    if (orderDetails.customerAddress) {
      setLoading(true); // Iniciar carga
      // Enviar el pedido al backend solo cuando todos los detalles del pedido estén completos
      axios
        .post("http://localhost:5000/api/order", {
          items: [orderDetails],
          total: orderDetails.price * orderDetails.quantity, // Asegúrate de calcular el total correctamente
          customerName: orderDetails.customerName,
          customerContact: orderDetails.customerContact,
          customerAddress: orderDetails.customerAddress,
        })
        .then(() => {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: "Tu pedido ha sido realizado con éxito. ¡Gracias!",
              sender: "bot",
            },
          ]);
          setOrderDetails({
            name: "",
            quantity: null,
            price: null, // Reiniciar precio
            customerName: "",
            customerContact: "",
            customerAddress: "",
          });
          setIsOrdering(false); // Finalizar el proceso de pedido
        })
        .catch((error) => {
          console.error("Error al realizar el pedido:", error);
          setError(
            "Hubo un problema al realizar tu pedido. Por favor, inténtalo de nuevo."
          );
        })
        .finally(() => {
          setLoading(false); // Finalizar carga
        });
    }
  }, [orderDetails.customerAddress, orderDetails]); // Agregar orderDetails al array de dependencias

  const handleSend = useCallback(
    (message) => {
      if (!message.trim()) return;

      const userMessage = { text: message, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Iniciar el proceso de pedido
      if (
        message.toLowerCase() === "quiero hacer un pedido" ||
        message.toLowerCase() === "ordenar"
      ) {
        setIsOrdering(true);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "¡Genial! ¿Qué te gustaría pedir?", sender: "bot" },
        ]);
        return; // Salir de la función para no enviar el mensaje al backend
      }

      if (isOrdering) {
        if (!orderDetails.name) {
          // Verificar que el elemento esté en el menú
          const menuItem = menu.find(
            (item) => item.name.toLowerCase() === message.toLowerCase()
          );
          if (menuItem) {
            setOrderDetails({
              ...orderDetails,
              name: menuItem.name,
              price: menuItem.price,
            });
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: `Has elegido ${menuItem.name}. ¿Cuántas unidades deseas?`,
                sender: "bot",
              },
            ]);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: "Lo siento, ese elemento no está en nuestro menú. Por favor, elige otro.",
                sender: "bot",
              },
            ]);
          }
        } else if (orderDetails.quantity === null) {
          const quantity = parseInt(message);
          if (!isNaN(quantity) && quantity > 0) {
            setOrderDetails({ ...orderDetails, quantity });
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: `Has elegido ${quantity} unidades de ${orderDetails.name}. ¿Cuál es tu nombre?`,
                sender: "bot",
              },
            ]);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: "Por favor, introduce una cantidad válida.",
                sender: "bot",
              },
            ]);
          }
        } else if (!orderDetails.customerName) {
          setOrderDetails({ ...orderDetails, customerName: message });
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: `Gracias, ${message}. ¿Cuál es tu contacto?`,
              sender: "bot",
            },
          ]);
        } else if (!orderDetails.customerContact) {
          setOrderDetails({ ...orderDetails, customerContact: message });
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: `Perfecto. ¿Cuál es tu dirección?`, sender: "bot" },
          ]);
        } else if (!orderDetails.customerAddress) {
          setOrderDetails({ ...orderDetails, customerAddress: message });
        }
        return; // Salir de la función para no enviar el mensaje al backend
      }

      // Enviar mensaje al backend si no estamos en proceso de pedido
      setLoading(true); // Iniciar carga
      axios
        .post("http://localhost:5000/api/chat", { message })
        .then((response) => {
          if (response.data) {
            const { answer, menu } = response.data;
            if (menu && Array.isArray(menu)) {
              const menuOptions = {
                text: "Aquí tienes nuestro menú:",
                options: menu.map((item) => ({
                  name: item.name,
                  description: item.description,
                  price: item.price.toFixed(2),
                })),
                sender: "bot",
              };
              const ctaMessage = {
                text: "¿Qué te apetece pedir hoy? 🤔 Escribe el nombre del plato que te gustaría ordenar.",
                sender: "bot",
              };
              setMessages((prevMessages) => [
                ...prevMessages,
                menuOptions,
                ctaMessage,
              ]);
            } else if (answer) {
              const botMessage = { text: answer, sender: "bot" };
              setMessages((prevMessages) => [...prevMessages, botMessage]);
            } else {
              throw new Error("Respuesta inesperada del servidor");
            }
          }
        })
        .catch((error) => {
          console.error("Error al enviar el mensaje:", error);
          setError(
            error.response?.data?.message ||
              "No se pudo enviar el mensaje. Intenta de nuevo."
          );
        })
        .finally(() => {
          setLoading(false); // Finalizar carga
          setInput("");
        });
    },
    [isOrdering, orderDetails, menu] // Agregar menu a las dependencias
  );

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

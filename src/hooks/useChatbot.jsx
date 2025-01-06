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

  useEffect(() => {
    const sendOrder = async () => {
      try {
        if (orderDetails.customerAddress) {
          setLoading(true); // Iniciar carga
          // Enviar el pedido al backend solo cuando todos los detalles del pedido estén completos
          await axios.post("http://localhost:5000/api/order", {
            items: [orderDetails],
            total: orderDetails.price * orderDetails.quantity, // Asegúrate de calcular el total correctamente
            customerName: orderDetails.customerName,
            customerContact: orderDetails.customerContact,
            customerAddress: orderDetails.customerAddress,
          });

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
        }
      } catch (error) {
        console.error("Error al realizar el pedido:", error);
        setError(
          "Hubo un problema al realizar tu pedido. Por favor, inténtalo de nuevo."
        );
      } finally {
        setLoading(false); // Finalizar carga
      }
    };

    sendOrder();
  }, [orderDetails]);

  const handleMenuItemSelection = useCallback(
    (message) => {
      const menuItem = menu.find(
        (item) => item.name.toLowerCase() === message.toLowerCase()
      );
      if (menuItem) {
        setOrderDetails((prevDetails) => ({
          ...prevDetails,
          name: menuItem.name,
          price: menuItem.price,
        }));
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
    },
    [menu]
  );

  const handleQuantitySelection = useCallback(
    (message) => {
      const quantity = parseInt(message);
      if (!isNaN(quantity) && quantity > 0) {
        setOrderDetails((prevDetails) => ({ ...prevDetails, quantity }));
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
    },
    [orderDetails.name]
  );

  const handleCustomerName = useCallback((message) => {
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      customerName: message,
    }));
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: `Gracias, ${message}. ¿Cuál es tu contacto?`, sender: "bot" },
    ]);
  }, []);

  const handleCustomerContact = useCallback((message) => {
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      customerContact: message,
    }));
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: `Perfecto. ¿Cuál es tu dirección?`, sender: "bot" },
    ]);
  }, []);

  const handleCustomerAddress = useCallback((message) => {
    setOrderDetails((prevDetails) => ({
      ...prevDetails,
      customerAddress: message,
    }));
  }, []);

  const handleOrderingProcess = useCallback(
    (message) => {
      if (!orderDetails.name) {
        handleMenuItemSelection(message);
      } else if (orderDetails.quantity === null) {
        handleQuantitySelection(message);
      } else if (!orderDetails.customerName) {
        handleCustomerName(message);
      } else if (!orderDetails.customerContact) {
        handleCustomerContact(message);
      } else if (!orderDetails.customerAddress) {
        handleCustomerAddress(message);
      }
    },
    [
      orderDetails,
      handleMenuItemSelection,
      handleQuantitySelection,
      handleCustomerName,
      handleCustomerContact,
      handleCustomerAddress,
    ]
  );

  const sendMessageToBackend = useCallback(async (message) => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/api/chat", {
        message,
      });

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
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
      setError(
        error.response?.data?.message ||
          "No se pudo enviar el mensaje. Intenta de nuevo."
      );
    } finally {
      setLoading(false);
      setInput("");
    }
  }, []);

  const handleSend = useCallback(
    async (message) => {
      if (!message.trim()) return;

      const userMessage = { text: message, sender: "user" };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      if (
        ["quiero hacer un pedido", "ordenar"].includes(message.toLowerCase())
      ) {
        setIsOrdering(true);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "¡Genial! ¿Qué te gustaría pedir?", sender: "bot" },
        ]);
        return;
      }

      if (isOrdering) {
        handleOrderingProcess(message);
        return;
      }

      await sendMessageToBackend(message);
    },
    [isOrdering, handleOrderingProcess, sendMessageToBackend]
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

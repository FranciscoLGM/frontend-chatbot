import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const useChatbot = () => {
  const [messages, setMessages] = useState([
    {
      text: "¡Bienvenido al chat! 🎉 ¿En qué puedo ayudarte hoy? Estoy aquí para asistirte con cualquier consulta o pedido. 😊",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [orderDetails, setOrderDetails] = useState({
    name: "",
    quantity: null,
    price: null,
    customerName: "",
    customerContact: "",
    customerAddress: "",
  });

  const fetchMenu = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/menu");
      if (response.data) {
        setMenuItems(response.data.menuItems);
      }
    } catch (error) {
      console.error("Error al obtener el menú:", error);
    }
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const sendOrder = useCallback(async () => {
    if (!orderDetails.customerAddress) return;
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/order", {
        items: [orderDetails],
        total: orderDetails.price * orderDetails.quantity,
        customerName: orderDetails.customerName,
        customerContact: orderDetails.customerContact,
        customerAddress: orderDetails.customerAddress,
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "🎉 Tu pedido ha sido realizado con éxito. ¡Gracias por tu compra!",
          sender: "bot",
        },
      ]);
      setOrderDetails({
        name: "",
        quantity: null,
        price: null,
        customerName: "",
        customerContact: "",
        customerAddress: "",
      });
      setIsOrdering(false);
      setIsConfirming(false);
    } catch (error) {
      console.error("Error al realizar el pedido:", error);
      setError(
        "⚠️ Hubo un problema al realizar tu pedido. Por favor, inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, [orderDetails]);

  const handleMenuItemSelection = useCallback(
    (message) => {
      const menuItem = menuItems.find(
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
    [menuItems]
  );

  const handleQuantitySelection = useCallback(
    (message) => {
      const quantity = parseInt(message, 10);
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
            text: "⚠️ Por favor, introduce una cantidad válida.",
            sender: "bot",
          },
        ]);
      }
    },
    [orderDetails.name]
  );

  const handleCustomerDetail = useCallback(
    (field, message, nextPrompt) => {
      setOrderDetails((prevDetails) => ({
        ...prevDetails,
        [field]: message,
      }));
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: nextPrompt, sender: "bot" },
      ]);

      if (field === "customerAddress") {
        setIsConfirming(true);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "🔍 Por favor, confirma tu pedido:",
            details: {
              Producto: orderDetails.name,
              Cantidad: orderDetails.quantity,
              Total: orderDetails.price * orderDetails.quantity,
              Cliente: orderDetails.customerName,
              Contacto: orderDetails.customerContact,
              Dirección: message,
            },
            sender: "bot",
            type: "confirmation",
          },
        ]);
      }
    },
    [orderDetails]
  );

  const handleOrderingProcess = useCallback(
    (message) => {
      if (!orderDetails.name) {
        handleMenuItemSelection(message);
      } else if (orderDetails.quantity === null) {
        handleQuantitySelection(message);
      } else if (!orderDetails.customerName) {
        handleCustomerDetail(
          "customerName",
          message,
          `Gracias, ${message}. ¿Cuál es tu número de teléfono? 📞`
        );
      } else if (!orderDetails.customerContact) {
        handleCustomerDetail(
          "customerContact",
          message,
          "Perfecto. ¿Cuál es tu dirección? 🏡"
        );
      } else if (!orderDetails.customerAddress) {
        handleCustomerDetail(
          "customerAddress",
          message,
          "¡Gracias! Confirmando tu pedido... 👍"
        );
      }
    },
    [
      orderDetails,
      handleMenuItemSelection,
      handleQuantitySelection,
      handleCustomerDetail,
    ]
  );

  const handleConfirmation = useCallback(
    (message) => {
      if (message.toLowerCase() === "confirmar") {
        sendOrder();
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: "❌ Pedido cancelado. Por favor, inicia de nuevo para realizar un pedido.",
            sender: "bot",
          },
        ]);
        setIsOrdering(false);
        setIsConfirming(false);
      }
    },
    [sendOrder]
  );

  const sendMessageToBackend = useCallback(async (message) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/chat", {
        message,
      });
      if (response.data) {
        const { answer, menuItems } = response.data;
        if (menuItems && Array.isArray(menuItems)) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: "📋 Aquí tienes nuestro menú:",
              options: menuItems.map((item) => ({
                name: item.name,
                description: item.description,
                price: item.price.toFixed(2),
              })),
              sender: "bot",
              type: "menu",
            },
            {
              text: "¿Qué te apetece pedir hoy? 🤔 Escribe el nombre del plato que te gustaría ordenar.",
              sender: "bot",
            },
          ]);
          setIsOrdering(true); // Iniciar proceso de pedido automáticamente
        } else if (answer) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: answer, sender: "bot" },
          ]);
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
      if (isConfirming) {
        handleConfirmation(message);
        return;
      }

      const orderKeywords = [
        "quiero hacer un pedido",
        "ordenar",
        "pedido",
        "quiero ordenar",
        "hacer un pedido",
        "realizar un pedido",
        "quiero pedir",
      ];
      const orderRegex = new RegExp(orderKeywords.join("|"), "i");
      if (orderRegex.test(message)) {
        setIsOrdering(true);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: "¡Genial! ¿Qué te gustaría pedir? 🍣", sender: "bot" },
        ]);
        return;
      }

      if (isOrdering) {
        handleOrderingProcess(message);
      } else {
        await sendMessageToBackend(message);
      }
    },
    [
      isOrdering,
      isConfirming,
      handleOrderingProcess,
      handleConfirmation,
      sendMessageToBackend,
    ]
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

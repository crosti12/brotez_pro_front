import { createContext, useContext, useRef } from "react";
import { Toast } from "primereact/toast";
import "./Notifications.css";
const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const toastRef = useRef(null);

  const showMessage = (message, severity = "info") => {
    toastRef.current?.show({
      severity,
      detail: message,
      life: 2000,
    });
  };

  return (
    <ToastContext.Provider value={{ showMessage }}>
      {children}
      <Toast className="notification-toast" ref={toastRef} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

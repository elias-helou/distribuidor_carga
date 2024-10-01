import CustomAlert from "@/components/CustomAlert";
import { Stack } from "@mui/material";
import { createContext, useContext, useState } from "react";

export interface Alerta {
  id: number;
  type: "success" | "info" | "warning" | "error";
  message: string;
  closeTime?: number
  //handleClose?: () => void;
}

interface AlertasInterface {
  alertas: Alerta[];
  setAlertas: React.Dispatch<React.SetStateAction<Alerta[]>>;
}

const AlertsContext = createContext<AlertasInterface>({
  alertas: [],
  setAlertas: () => [],
});

export function AlertsWrapper({ children }: { children: React.ReactNode }) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  // /**
  //  * Função que adiciona um novo alerta no state.
  //  * @param newAlert Novo objeto a ser inserido no state de alertas.
  //  */
  // const addAlert = (type: "success" | "info" | "warning" | "error", message: string, closeTime: number = 3) => {
  //   setAlertas([...alertas, {id: new Date().getTime(), type: type, message: message, closeTime: closeTime}]); // Adiciona novo alerta ao array
  // };

  /**
   * Remove um objeto do state de alertas.
   * @param index Index do objeto dentro do state.
   */
  const removeAlert = (index: number) => {
    const newAlerts = alertas.filter((alert) => alert.id !== index);
    setAlertas([...newAlerts]);
  };

  return (
    <AlertsContext.Provider
      value={{
        alertas,
        setAlertas,
      }}
    >
      {children}
      <Stack position="fixed" bottom={16} right={16} zIndex={9999} spacing={1}>
        {alertas.map((alerta) => (
            <CustomAlert
              key={alerta.id}
              type={alerta.type}
              message={alerta.message}
              id={alerta.id}
              closeTime={alerta.closeTime ? alerta.closeTime : 3}
              handleClose={() => removeAlert(alerta.id)} // Remove o alerta quando for fechado
            />
          ))}
        
      </Stack>
    </AlertsContext.Provider>
  );
}

export function useAlertsContext() {
  return useContext(AlertsContext);
}

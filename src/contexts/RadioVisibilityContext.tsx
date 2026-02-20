import React, { createContext, useContext, useState } from 'react';

interface RadioVisibilityContextType {
  isRadioVisible: boolean;
  toggleRadio: () => void;
}

const RadioVisibilityContext = createContext<RadioVisibilityContextType>({
  isRadioVisible: false,
  toggleRadio: () => {},
});

export const useRadioVisibility = () => useContext(RadioVisibilityContext);

export const RadioVisibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRadioVisible, setIsRadioVisible] = useState(false);

  const toggleRadio = () => setIsRadioVisible(prev => !prev);

  return (
    <RadioVisibilityContext.Provider value={{ isRadioVisible, toggleRadio }}>
      {children}
    </RadioVisibilityContext.Provider>
  );
};

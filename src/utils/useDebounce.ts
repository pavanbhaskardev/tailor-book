import { useState, useEffect } from "react";

const useDebounce = ({
  delay,
  value = "",
}: {
  delay: number;
  value: string;
}) => {
  const [newValue, setNewValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setNewValue(value);
    }, delay);

    return () => {
      clearTimeout(timeout);
    };
  }, [delay, value]);

  return newValue;
};

export default useDebounce;

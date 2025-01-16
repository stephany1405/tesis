import { useState, useEffect } from "react";

export const useSelectedAppointment = (initialSelectedDate) => {
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);

  useEffect(() => {
    setSelectedDate(initialSelectedDate);
  }, [initialSelectedDate]);

  return selectedDate;
};

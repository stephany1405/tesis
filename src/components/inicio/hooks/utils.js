export const formatDuration = (duration) => {
  const hours = Math.floor(duration);
  const minutes = Math.round((duration - hours) * 60);

  let formattedDuration = "";

  if (hours > 0) {
    formattedDuration += `${hours} hora${hours > 1 ? "s" : ""}`;
  }

  if (minutes > 0) {
    if (formattedDuration) {
      formattedDuration += " ";
    }
    formattedDuration += `${minutes} minuto${minutes > 1 ? "s" : ""}`;
  }

  if (!formattedDuration) {
    formattedDuration = "0 minutos";
  }

  return formattedDuration;
};

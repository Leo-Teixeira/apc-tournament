export const parseDateTimeLocal = (isoString: string) => {
  const [datePart, timePart] = isoString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
};

export const formatDate = (value: string | Date) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("fr-FR", { timeZone: "UTC" });
};

export const formatHour = (value: string | Date) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC"
  });
};

export const formatDuration = (
  startValue: string | Date,
  endValue: string | Date
) => {
  const start = new Date(startValue);
  const end = new Date(endValue);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";
  const durationMs = end.getTime() - start.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return minutes > 0
    ? `${hours}h${minutes.toString().padStart(2, "0")}`
    : `${hours}h`;
};

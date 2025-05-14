export const utils_time_convertTimeStringToSeconds = (time: string): number => {
  const [hours, minutes, seconds] = time.split(":").map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

export const utils_time_getCurrentTimeString = (): string => {
  const formatTime = (number: number) => {
    return number < 10 ? "0" + number : number;
  };
  const now = new Date();
  const hours = formatTime(now.getHours());
  const minutes = formatTime(now.getMinutes());
  const seconds = formatTime(now.getSeconds());
  return `${hours}:${minutes}:${seconds}`;
};

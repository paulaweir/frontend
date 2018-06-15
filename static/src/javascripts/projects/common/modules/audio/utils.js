export {
  format,
  formatTime
};

const format = (t: number) =>
  t.toFixed(0).padStart(2, '0');

const formatTime = (t: number) => {
  const second = Math.floor(t % 60);
  const minute = Math.floor(t % 3600 / 60);
  const hour = Math.floor(t / 3600);
  return hour === 0 ? `${format(minute)}:${format(second)}` :
    `${format(hour)}:${format(minute)}:${format(second)}`;
}
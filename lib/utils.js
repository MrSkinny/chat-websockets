module.exports = {
  formatChatDate(date) {
    function pad(num){
      return num < 10 ? `0${num}` : num;
    }

    let hours = pad(date.getHours());
    let minutes = pad(date.getMinutes());
    let seconds = pad(date.getSeconds());

    return `${hours}:${minutes}:${seconds}`;
  }
};

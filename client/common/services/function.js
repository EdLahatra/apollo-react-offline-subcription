const moment = require('moment-timezone');

export const timeTz = (zone) => {
  let date;
  if (zone) {
    let min;
    min = moment().tz(zone).get('minutes');
    if (min < 10) {
      min = `0${min}`;
    }
    date = {
      hour: moment().tz(zone).get('hours'),
      min,
    };
  }
  return date;
};

export const isNotEmptyObject = data => Object.keys(data).length > 0;

export const comparison = (a, b) => a === b;

export const findIndexObject = (Obj, key, index) =>
  Obj.findIndex(row => row[key].toString() === index.toString()) > -1;

export const lastConnectionTime = (newDate, date) => {
  if (date === 0) {
    return 'never connected';
  }
  const time = newDate - date;
  let day = 0;
  let hour = 0;
  let minute = 0;
  let result = `${parseInt(time, 10)} sec ago`;
  if (time <= 0) {
    result = 'just now';
  } else if (time >= 86400) {
    day = Math.floor(time / 86400);
    result = `${parseInt(day, 10)} day`;
  } else if (time < 86400 && time >= 3600) {
    hour = Math.floor(time / 3600);
    result = `${parseInt(hour, 10)} hour`;
  } else if (time < 3600 && time >= 60) {
    minute = Math.floor(time / 60);
    result = `${parseInt(minute, 10)} min`;
  }

  return result;
};

export const findIndexInArray = (obj, value) => obj.indexOf(value);

import { MILLISECOND_CONVERSION } from './date.consts';

const getTodaysDateToTheHour = () => {
  const timezoneOffset =
    new Date().getTimezoneOffset() * MILLISECOND_CONVERSION.MINUTE;
  return new Date(new Date().setHours(0, 0, 0, 0) - timezoneOffset);
};

export const DateGenerator = {
  getTodaysDateToTheHour,
};

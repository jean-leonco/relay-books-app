import MockDate from 'mockdate';

let runningDate: Date | null = null;

export const resetRunningDate = () => {
  runningDate = null;
};

export const ONE_SECOND_IN_MILLISECONDS = 1000;
export const N_SECONDS_IN_MILLISECONDS = (n: number) => ONE_SECOND_IN_MILLISECONDS * n;

export const ONE_MINUTE_IN_MILLISECONDS = 1000 * 60;
export const N_MINUTES_IN_MILLISECONDS = (n: number) => ONE_MINUTE_IN_MILLISECONDS * n;

export const ONE_HOUR_IN_MILLISECONDS = 1000 * 60 * 60;
export const N_HOURS_IN_MILLISECONDS = (n: number) => ONE_HOUR_IN_MILLISECONDS * n;

export const ONE_DAY_IN_MILLISECONDS = 1000 * 60 * 60 * 24;
export const N_DAYS_IN_MILLISECONDS = (n: number) => ONE_DAY_IN_MILLISECONDS * n;

export const plusDate = (date, increment) => new Date(date.valueOf() + increment);

export const bumpDate = (date: Date = new Date('01/01/2021'), increment = ONE_DAY_IN_MILLISECONDS) => {
  if (runningDate === null) {
    runningDate = date;
  }

  const plusDateResult = plusDate(runningDate, increment);

  MockDate.set(plusDateResult);
  runningDate = plusDateResult;
  return plusDateResult;
};

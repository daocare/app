import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const Countdown = () => {
  const currentIterationDeadline = useSelector(
    (state) => state.iteration.currentIterationDeadline
  );

  const [countdown, setCountdown] = useState(
    currentIterationDeadline - Date.now()
  );

  useEffect(() => {
    setCountdown(currentIterationDeadline - Date.now() / 1000);
  }, [currentIterationDeadline]);

  useEffect(() => {
    countdown > 0 && setTimeout(() => setCountdown(countdown - 1), 1000);
  }, [countdown, currentIterationDeadline]);

  const [now] = useState(Date.now());

  const wordPluralizeAndDisplay = (noOfTimeFrame, timeFrame) => {
    let time =
      noOfTimeFrame > 0
        ? noOfTimeFrame + ' ' + timeFrame + (noOfTimeFrame > 1 ? 's' : '')
        : '';
    return time;
  };

  const formattedCountdown = (timestamp) => {
    const numberOfSecondsUntilEnd = timestamp;
    let days = Math.floor(numberOfSecondsUntilEnd / 86400);
    let remainingHoursInSeconds = numberOfSecondsUntilEnd - days * 86400;
    let hours = Math.floor(remainingHoursInSeconds / 3600);
    let remainingMinutesInSeconds = remainingHoursInSeconds - hours * 3600;
    let minutes = Math.floor(remainingMinutesInSeconds / 60);
    let remainingSeconds = remainingMinutesInSeconds - minutes * 60;
    let seconds = Math.floor(remainingSeconds);
    return `${wordPluralizeAndDisplay(days, 'day')} ${wordPluralizeAndDisplay(
      hours,
      'hour'
    )} ${wordPluralizeAndDisplay(minutes, 'minute')} ${
      seconds > 0 ? 'and' : ''
    } ${wordPluralizeAndDisplay(seconds, 'second')}`;
  };

  return <span>{formattedCountdown(countdown)}</span>;
};

export default Countdown;

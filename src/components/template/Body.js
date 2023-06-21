import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { modal, logger } from 'util/com';

import 'styles/Template.scss';
const Timer = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    logger.debug('mount Timer');
    const timer_handle = setInterval(() => {
      setTime(() => moment().format('YYYY-MM-DD HH:mm:ss'));
    }, 500);

    return () => clearInterval(timer_handle);
  }, []);

  const onClick = () => {
    modal.alert('success', '', time);
  };

  return <div onClick={onClick}>{time}</div>;
};

const Body = ({ title, myClass, children }) => {
  logger.render('Template Body');
  useEffect(() => {}, []);

  return (
    <>
      <div className={`body ${myClass}`}>{children}</div>
    </>
  );
};
export default React.memo(Body);

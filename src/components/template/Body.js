import React, { useEffect, useState } from 'react';
import moment from 'moment';
import com, { modal, logger, navigate } from 'util/com';
import Recoils from 'recoils';
import { Card } from 'react-bootstrap';
import { navigate_ref } from 'components/common/NavigateCtr';

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

const Body = ({ title, children }) => {
  logger.render('Template Body');
  useEffect(() => {}, []);

  return (
    <>
      <div className="body">{children}</div>
    </>
  );
};

export default React.memo(Body);

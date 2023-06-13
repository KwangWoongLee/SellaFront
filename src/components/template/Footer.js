import React, { useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { logger } from 'util/com';
import { Link } from 'react-router-dom';

import 'styles/Template.scss';

const Footer = () => {
  logger.render('Template Footer');
  useEffect(() => {}, []);

  return (
    <>
      <div className="footer"></div>
    </>
  );
};

export default React.memo(Footer);

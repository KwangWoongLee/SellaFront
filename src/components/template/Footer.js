import React, { useEffect } from 'react';
import { logger } from 'util/com';

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

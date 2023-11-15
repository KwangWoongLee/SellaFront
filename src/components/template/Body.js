import React, { useEffect } from 'react';
import { logger } from 'util/com';

const Body = ({ myClass, children }) => {
  //logger.debug('Template Body');
  useEffect(() => {}, []);

  return (
    <>
      <div id="body" className={`body ${myClass}`}>
        {children}
      </div>
    </>
  );
};
export default React.memo(Body);

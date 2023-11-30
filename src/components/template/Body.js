import React, { useEffect } from 'react';
import { logger } from 'util/com';
import useScript from 'react-script-hook';

const Body = ({ myClass, children }) => {
  //logger.debug('Template Body');
  useEffect(() => {}, []);

  useScript({
    src: 'https://cdn.iamport.kr/v1/iamport.js',
    onload: () => {
      window.IMP.init('imp85285548');
    },
    checkForExisting: true,
  });

  return (
    <>
      <div id="body" className={`body ${myClass}`}>
        {children}
      </div>
    </>
  );
};
export default React.memo(Body);

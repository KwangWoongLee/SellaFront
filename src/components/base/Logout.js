import React, { useEffect } from 'react';

import { logger, navigate } from 'util/com';
import Recoils from 'recoils';
import request from 'util/request';

const Logout = () => {
  logger.render('Logout');

  useEffect(() => {
    request.post('logout', {}).then((ret) => {
      if (!ret.err) {
        Recoils.resetState('CONFIG:ACCOUNT');
        navigate('/');
      }
    });
  }, []);

  return <></>;
};

export default React.memo(Logout);

import React, { useEffect } from 'react';

import com, { logger, navigate } from 'util/com';
import Recoils from 'recoils';
import request from 'util/request';

const Logout = () => {
  useEffect(() => {
    request.post('logout', {}).then((ret) => {
      if (!ret.err) {
        com.storage.setItem('access_token', '');
        com.storage.setItem('refresh_token', '');

        Recoils.resetState('CONFIG:ACCOUNT');
        navigate('/');
      }
    });
  }, []);

  return <></>;
};

export default React.memo(Logout);

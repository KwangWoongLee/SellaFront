import React from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import Recoils from 'recoils';
import { logger } from 'util/com';

import 'styles/Spinner.scss';

const MySpinner = () => {
  const show = Recoils.useValue('SPINEER');
  logger.render('MySpinner : ', show);
  return (
    <Modal show={show} fullscreen className="MySpinner">
      <div class="loader loader-7"></div>
    </Modal>
  );
};

export default React.memo(MySpinner);

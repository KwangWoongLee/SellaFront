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
      <Spinner animation="border" variant="info" className="box" />
    </Modal>
  );
};

export default React.memo(MySpinner);

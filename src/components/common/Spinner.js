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
      <div class="vertical-centered-box">
        <div class="content">
          <div class="loader-circle"></div>
          <div class="loader-line-mask">
            <div class="loader-line"></div>
          </div>
          <svg width="39" height="45" viewBox="0 0 39 45" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19.5 0L0 11.2519V33.7481L19.5 45L39 33.7481V11.2519L19.5 0ZM28.3229 17.7818H21.7207C21.7426 17.3408 21.6202 16.9046 21.372 16.5393C21.1238 16.174 20.7632 15.8994 20.3449 15.7571V10.0116C25.4218 10.3553 28.3229 13.2243 28.3229 17.7818ZM18.6925 9.99668V15.6077C17.7504 15.7496 16.9653 16.2577 16.9653 17.1841C16.9653 18.1106 17.6457 18.5066 18.6925 18.8951V24.8722L18.1168 24.7302C14.6175 23.9084 10.2061 22.8175 10.2061 17.3784C10.2061 12.8582 13.4062 10.2059 18.6925 9.99668ZM9.89954 26.7251H16.6961C16.6812 27.3004 16.8752 27.8616 17.2421 28.3052C17.6091 28.7488 18.1242 29.0447 18.6925 29.1383V34.966C13.309 34.6895 9.89954 31.6636 9.89954 26.7251ZM20.3673 34.9959V29.1383C20.8581 29.0835 21.3141 28.8582 21.6557 28.5018C21.9973 28.1455 22.2029 27.6806 22.2366 27.1883C22.2366 26.2469 21.4889 25.694 20.3673 25.3279V19.4255L21.0029 19.5899C24.5021 20.4641 29.1005 21.6669 29.1005 27.0911C29.1005 32.0521 25.4741 34.7418 20.3449 34.9959H20.3673Z"
              fill="white"
            />
          </svg>
        </div>
      </div>
    </Modal>
  );
};

export default React.memo(MySpinner);

import React, { useEffect } from 'react';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import Recoils from 'recoils';

import { logger } from 'util/com';

const Manual = () => {
  logger.render('Manual');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={``}>
        <CSCenterNavTab active="/cscenter/manual" />
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Manual);

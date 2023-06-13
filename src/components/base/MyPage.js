import React, { useEffect } from 'react';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { logger, modal, navigate } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';

const MyPage = () => {
  logger.render('MyPage');

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`ver ${process.env.REACT_APP_VERSION}`} className="MyPage">
        <p>
          <strong className="text-success"> </strong>
        </p>
      </Body>
      <Footer />
    </>
  );
};

for (const name in process.env) {
  logger.info(`${name} = ${process.env[name]}`);
}

export default React.memo(MyPage);

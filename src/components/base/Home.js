import React, { useEffect } from 'react';

import 'styles/Home.scss';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { logger } from 'util/com';

const Home = () => {
  logger.render('Home');

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`ver ${process.env.REACT_APP_VERSION}`} className="Home">
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

export default React.memo(Home);

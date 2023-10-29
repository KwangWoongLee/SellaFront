import React, { useEffect, useState } from 'react';
import { Button, InputGroup, Form, Nav } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate, modal } from 'util/com';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import _ from 'lodash';

// import 'styles/NoLogin_Home.scss';

const NoLogin_Home = () => {
  logger.render('NoLogin_Home');
  return (
    <>
      <Head />
      <Body title={`메인`} myClass={'nologin_home'}>
        비로그인 메인화면
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(NoLogin_Home);

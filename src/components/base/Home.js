import React, { useEffect, useState } from 'react';
import { Button, InputGroup, Form, Nav } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate, modal } from 'util/com';
import Head from 'components/template/Head_home';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import _ from 'lodash';

// import 'styles/Home.scss';

const Home = () => {
  return (
    <>
      <Head />
      <Body title={`메인`} myClass={'home'}>
        메인화면
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Home);

import React, { useEffect, useState } from 'react';
import { Button, InputGroup, Form, Nav } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, navigate, modal } from 'util/com';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import _ from 'lodash';

// import 'styles/LowestPrice.scss';

const LowestPrice = () => {
  return (
    <>
      <Head />
      <Body title={`최저가 계산`} myClass={'lowestprice'}>
        최저가 계산화면
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(LowestPrice);

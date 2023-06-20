import React, { useState, useEffect } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import SettlementNavTab from 'components/settlement/SettlementNavTab';

import { logger } from 'util/com';

const StandardProduct = () => {
  logger.render('StandardProduct');

  const [info, setInfo] = useState(null);

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`기준상품 연결 조회`}>
        <SettlementNavTab active="/settlement/standard_product" />
        <div className="StandardProduct"></div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(StandardProduct);

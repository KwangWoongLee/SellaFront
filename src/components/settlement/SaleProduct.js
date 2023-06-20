import React, { useState, useEffect } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import SettlementNavTab from 'components/settlement/SettlementNavTab';

import { logger } from 'util/com';

const SaleProduct = () => {
  logger.render('SaleProduct');

  const [info, setInfo] = useState(null);

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`판매상품 연결조회`}>
        <SettlementNavTab active="/settlement/sale_product" />
        <div className="SaleProduct"></div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(SaleProduct);

import React, { useState, useEffect } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import {} from 'util/com';
import SettlementNavTab from 'components/settlement/common/SettlementNavTab';
import FormsMatchTable from 'components/settlement/common/FormsMatchTable';
import GoodsMatchTable from 'components/settlement/common/GoodsMatchTable';
import CategoryFee_Search from 'components/settlement/common/CategoryFee_Search';
import StandardProduct_Search from 'components/settlement/common/StandardProduct_Search';

import { logger } from 'util/com';
import Recoils from 'recoils';

import 'styles/SaleProduct.scss';

const SaleProduct = () => {
  logger.render('SaleProduct');

  const [rowData, setRowData] = useState([]);
  const forms_match = [...Recoils.getState('DATA:FORMSMATCH')];

  useEffect(() => {
    setRowData([...forms_match]);
  }, []);

  const onDelete = (d) => {
    console.log('SaleProduct DELETE');
  };

  const onSelect = () => {
    console.log('SaleProduct SELECT');
  };

  return (
    <>
      <Head />
      <Body title={`판매상품 연결조회`} myClass={'sale_product'}>
        <SettlementNavTab active="/settlement/sale_product" />
        <div className="page">
          <div className="section1">
            <h3>판매 상품 연결 조회</h3>
            <FormsMatchTable rows={rowData} selectCallback={onSelect} deleteCallback={onDelete}></FormsMatchTable>
            <h3>연결 상품</h3>
            <GoodsMatchTable rows={rowData} selectCallback={onSelect} deleteCallback={onDelete}></GoodsMatchTable>
          </div>
          <div className="section2">
            <h3>연결할 기준 상품 검색</h3>
            <StandardProduct_Search></StandardProduct_Search>
            <h3>수수료 검색</h3>
            <CategoryFee_Search></CategoryFee_Search>
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(SaleProduct);

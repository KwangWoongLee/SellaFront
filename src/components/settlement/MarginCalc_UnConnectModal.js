import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import FormsMatchTable from 'components/settlement/common/FormsMatchTable';
import GoodsMatchTable from 'components/settlement/common/GoodsMatchTable';
import CategoryFee_Search from 'components/settlement/common/CategoryFee_Search';
import StandardProduct_Search from 'components/settlement/common/StandardProduct_Search';
import _ from 'lodash';

import { logger } from 'util/com';

import 'styles/MarginCalc_UnConnectModal.scss';

import icon_close from 'images/icon_close.svg';

const MarginCalc_UnConnectModal = React.memo(({ modalState, setModalState, rowData, callback }) => {
  logger.render('MarginCalc_UnConnectModal');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const nameRef = useRef(null);
  const [items, setItems] = useState([]);
  const [goodsMatch, setGoodsMatchs] = useState([]);
  const [standardItems, setStandardItems] = useState([]);

  useEffect(() => {}, [modalState]);

  useEffect(() => {
    setItems(_.filter(rowData, { connect_flag: false }));
  }, [rowData]);

  useEffect(() => {
    setItems(_.filter(rowData, { connect_flag: false }));
  }, [rowData]);

  const onClose = () => setModalState(false);
  const onDelete = (d) => {
    console.log('MarginCalc_UnConnectModal DELETE');
    callback(d);
  };

  const onSelectFormsMatchTable = (d) => {
    const goods = Recoils.getState('DATA:GOODS');
    const recommends = _.filter(goods, { name: d.forms_product_name });

    setStandardItems([...recommends]);
  };
  const onDeleteFormsMatchTable = () => {};

  const onSelectGoodsMatchTable = () => {};
  const onDeleteGoodsMatchTable = () => {};
  const onSelectStandardProduct_Seach = (d) => {
    setGoodsMatchs([...goodsMatch, d]);
  };
  return (
    <Modal show={modalState} onHide={onClose} centered className="modal UnConnect">
      <Modal.Header>
        <Modal.Title>상품 매칭 관리</Modal.Title>
        <Button variant="primary" className="btn_close">
          <img src={icon_close} />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <div className="section1">
          <div className="tablebox1">
            <h3>
              미연결 주문 <span>{items.length}</span>
            </h3>
            <FormsMatchTable
              rows={items}
              selectCallback={onSelectFormsMatchTable}
              deleteCallback={onDeleteFormsMatchTable}
            ></FormsMatchTable>
          </div>
          <div className="tablebox2">
            <h3>연결 상품</h3>
            <GoodsMatchTable
              rows={goodsMatch}
              selectCallback={onSelectGoodsMatchTable}
              deleteCallback={onDeleteGoodsMatchTable}
            ></GoodsMatchTable>
          </div>
        </div>
        <div className="section2">
          <div className="tablebox1">
            <h3>연결할 기준 상품 검색</h3>
            <StandardProduct_Search
              rows={standardItems}
              selectCallback={onSelectStandardProduct_Seach}
            ></StandardProduct_Search>
          </div>
          <div className="tablebox2">
            <h3>수수료 검색</h3>
            <CategoryFee_Search></CategoryFee_Search>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(MarginCalc_UnConnectModal);

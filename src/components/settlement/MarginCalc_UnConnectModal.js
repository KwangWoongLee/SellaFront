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

const MarginCalc_UnConnectModal = React.memo(({ modalState, setModalState, rowData, callback }) => {
  logger.render('MarginCalc_UnConnectModal');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const nameRef = useRef(null);
  const [items, setItems] = useState([]);

  useEffect(() => {}, [modalState]);

  useEffect(() => {
    setItems(_.filter(rowData, { connect_flag: false }));
  }, [rowData]);

  const onClose = () => setModalState(false);
  const onDelete = (d) => {
    console.log('MarginCalc_UnConnectModal DELETE');
    callback(d);
  };

  const onSelect = () => {
    console.log('MarginCalc_UnConnectModal SELECT');
  };

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal">
      <Modal.Header>
        <Modal.Title>상품 매칭 관리</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <span>미연결 주문 {items.length}건</span>
        <FormsMatchTable rows={items} selectCallback={onSelect} deleteCallback={onDelete}></FormsMatchTable> <br />
        <br />
        <br />
        <GoodsMatchTable rows={items} selectCallback={onSelect} deleteCallback={onDelete}></GoodsMatchTable>
        <br />
        <br />
        <br />
        <StandardProduct_Search></StandardProduct_Search>
        <br />
        <br />
        <br />
        <br />
        <CategoryFee_Search></CategoryFee_Search>
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(MarginCalc_UnConnectModal);

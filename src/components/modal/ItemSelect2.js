import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Form, Stack, Dropdown, Table, Container, Row, Col } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, useInput, modal } from 'util/com';
import 'styles/Modal.scss';
import _ from 'lodash';

// 나중에 react-virtualized 혹은 react-window 이용해서 가상화 해주자, 너무 느리다.

const ItemSelectModal2 = () => {
  const [state, setState] = Recoils.useState('MODAL:ITEMSELECT2');
  const input_code = useRef(null);
  const input_name = useRef(null);
  const input_stock_price = useRef(null);
  const input_delivery_fee = useRef(null);
  const input_packing_fee = useRef(null);
  const input_category = useRef(null);

  logger.render('ItemSelectModal2 : ', state.show);

  useEffect(() => {}, []);

  const onClose = () => {
    setState({ ...state, show: false, type: undefined, cb: undefined });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const code = input_code.current.value;
    const category = input_category.current.value;
    const name = input_name.current.value;
    const stock_price = Number(input_stock_price.current.value);
    const delivery_fee = Number(input_delivery_fee.current.value);
    const packing_fee = Number(input_packing_fee.current.value);
    const aidx = com.storage.getItem('aidx');

    if (!code) return modal.alert('error', '바코드가 입력되지 않았습니다.');
    if (!category) return modal.alert('error', '카테고리가 입력되지 않았습니다.');
    if (!name) return modal.alert('error', '상품명이되지 않았습니다.');
    if (!stock_price) return modal.alert('error', '입고가격이 입력되지 않았습니다.');
    if (!delivery_fee) return modal.alert('error', '배송비가 입력되지 않았습니다.');
    if (!packing_fee) return modal.alert('error', '포장비가 입력되지 않았습니다.');

    if (state.cb) {
      state.cb({
        code,
        category,
        name,
        stock_price,
        packing_fee,
        delivery_fee,
        aidx,
      });
    }

    onClose();
  };

  return (
    <Modal show={state.show} onHide={onClose} backdrop="static" dialogClassName="modal-90w" className="ItemSelect">
      <Modal.Header closeButton>
        <Modal.Title className="text-primary">
          <h4>상품 추가</h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col xs={3}>
              <Form onSubmit={onSubmit} id="item-modal-form">
                <Form.Group className="mb-3">
                  <Form.Label>카테고리</Form.Label>
                  <Form.Control ref={input_category} type="text" placeholder="카테고리" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>상품명</Form.Label>
                  <Form.Control ref={input_name} type="text" placeholder="상품명" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>바코드</Form.Label>
                  <Form.Control ref={input_code} type="number" placeholder="바코드" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>입고가격</Form.Label>
                  <Form.Control ref={input_stock_price} type="number" placeholder="입고가격" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>포장비</Form.Label>
                  <Form.Control ref={input_packing_fee} type="number" placeholder="포장비" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>배송비</Form.Label>
                  <Form.Control ref={input_delivery_fee} type="number" placeholder="배송비" />
                </Form.Group>
              </Form>
              <hr />
              <div className="d-flex justify-content-around">
                <Button variant="primary" type="submit" form="item-modal-form">
                  확인
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  취소
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </Modal.Body>
    </Modal>
  );
};
export default React.memo(ItemSelectModal2);

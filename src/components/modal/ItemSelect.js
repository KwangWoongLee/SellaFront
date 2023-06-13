import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button, Form, Stack, Dropdown, Table, Container, Row, Col } from 'react-bootstrap';
import Recoils from 'recoils';
import com, { logger, useInput, modal } from 'util/com';
import 'styles/Modal.scss';
import _ from 'lodash';

// 나중에 react-virtualized 혹은 react-window 이용해서 가상화 해주자, 너무 느리다.

const ItemSelectModal = () => {
  const [state, setState] = Recoils.useState('MODAL:ITEMSELECT');
  const input_no = useRef(null);
  const input_min_price = useRef(null);
  const input_price_gap = useRef(null);
  const input_discount = useRef(null);
  const input_compare = useRef(null);
  const input_link = useRef(null);
  const input_link2 = useRef(null);

  logger.render('ItemSelectModal : ', state.show);

  useEffect(() => {}, []);

  const onClose = () => {
    setState({ ...state, show: false, type: undefined, cb: undefined });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const no = input_no.current.value;
    const min_price = Number(input_min_price.current.value);
    const price_gap = Number(input_price_gap.current.value);
    const discount = input_discount.current.value;
    const link = input_link.current.value;
    const link2 = input_link2.current.value;
    const compare = input_compare.current.value;
    const aidx = com.storage.getItem("aidx");

    if (!no) return modal.alert('error', '아이템이 선택되지 않았습니다.');
    if (!min_price) return modal.alert('error', '갯수값이 입력되지 않았습니다.');
    if (!price_gap) return modal.alert('error', '가격 차이 설정값이 입력되지 않았습니다.');
    if (!discount) return modal.alert('error', '할인값이 입력되지 않았습니다.');
    if (!compare) return modal.alert('error', '가격 비교 기준이 입력되지 않았습니다.');
    if (!link) return modal.alert('error', '링크가 올바르지 않습니다.');
    if (!link2) return modal.alert('error', '링크2가 올바르지 않습니다.');

    if (state.cb) {
      state.cb({
        aidx,
        no,
        min_price,
        price_gap,
        discount,
        compare,
        link,
        link2,
      });
    }

    onClose();
  };

  return (
    <Modal show={state.show} onHide={onClose} backdrop="static" dialogClassName="modal-90w" className="ItemSelect">
      <Modal.Header closeButton>
        <Modal.Title className="text-primary">
          <h4>아이템 추가</h4>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Row>
            <Col xs={3}>
              <Form onSubmit={onSubmit} id="item-modal-form">
                <Form.Group className="mb-3">
                  <Form.Label>상품 번호</Form.Label>
                  <Form.Control ref={input_no} type="text" placeholder="상품 번호" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>최저가</Form.Label>
                  <Form.Control ref={input_min_price} type="number" placeholder="최저가" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>가격 차이</Form.Label>
                  <Form.Control ref={input_price_gap} type="number" placeholder="가격 차이 설정값" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>할인((1 : 적용 안함, 2 : %, 3 : 원))</Form.Label>
                  <Form.Control ref={input_discount} type="number" placeholder="할인" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>가격 비교 기준(최저가사이트 : 1, 네이버 스마트 스토어 : 2)</Form.Label>
                  <Form.Control ref={input_compare} type="number" placeholder="가격 비교 기준" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>링크</Form.Label>
                  <Form.Control ref={input_link} type="text" placeholder="링크" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>링크2</Form.Label>
                  <Form.Control ref={input_link2} type="text" placeholder="링크2" />
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
export default React.memo(ItemSelectModal);

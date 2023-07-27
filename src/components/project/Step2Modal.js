import React, { useState, useEffect } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';
const sd_str = ['Y', 'N'];

const InputModal = React.memo(({ modalState, setModalState, callback }) => {
  logger.render('Step2Modal');

  const [sdType, setSDType] = useState(0);
  useEffect(() => {
    if (modalState) {
    }
  }, [modalState]);

  const onSubmit = (e) => {
    e.preventDefault();

    const goods_category = e.currentTarget[0].value;
    const name = e.currentTarget[1].value;
    const stock_price = e.currentTarget[2].value;
    const box_amount = e.currentTarget[3].value ? e.currentTarget[3].value : 0;
    const single_delivery = e.currentTarget[4].value;
    const barcode = e.currentTarget[6].value;
    const rrp = e.currentTarget[7].value;
    const memo = e.currentTarget[8].value;

    if (!goods_category) return alert('카테고리 항목이 비었습니다.');
    if (!name) return alert('상품명 항목이 비었습니다.');
    if (!stock_price) return alert('입고단가 항목이 비었습니다.');

    request
      .post('user/goods/insert', {
        goods_category,
        name,
        stock_price,
        box_amount,
        single_delivery,
        barcode,
        rrp,
        memo,
      })
      .then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          callback(data ? data[0] : null);
          onClose();
        }
      });
  };

  const onClose = () => setModalState(false);

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal step2">
      <Modal.Header>
        <Modal.Title>상품추가</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit} id="insert-form">
          <div>
            <FloatingLabel label="카테고리" className="mb-1">
              <Form.Control type="text" placeholder="카테고리" defaultValue={''} />
            </FloatingLabel>
            <FloatingLabel label="상품명" className="mb-1">
              <Form.Control type="text" placeholder="상품명" defaultValue={''} />
            </FloatingLabel>
            <FloatingLabel label="입고단가" className="mb-1">
              <Form.Control type="number" placeholder="입고단가" defaultValue={''} />
            </FloatingLabel>
            <FloatingLabel label="박스입수량" className="mb-1">
              <Form.Control type="number" placeholder="박스입수량" defaultValue={''} />
            </FloatingLabel>
            <Form.Control type="hidden" defaultValue={sd_str[sdType]} />
            단독배송
            <DropdownButton variant="" title={sd_str[sdType]}>
              {sd_str.map((name, key) => (
                <Dropdown.Item
                  key={key}
                  eventKey={key}
                  onClick={(e) => {
                    setSDType(key);
                  }}
                  active={sdType === key}
                >
                  {sd_str[key]}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <FloatingLabel label="바코드" className="mb-1">
              <Form.Control type="text" placeholder="바코드" defaultValue={''} />
            </FloatingLabel>
            <FloatingLabel label="권장소비자가" className="mb-1">
              <Form.Control type="number" placeholder="권장소비자가" defaultValue={''} />
            </FloatingLabel>
            <FloatingLabel label="메모" className="mb-1">
              <Form.Control type="text" placeholder="메모" defaultValue={''} />
            </FloatingLabel>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" form="insert-form">
          추가
        </Button>
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

export default React.memo(InputModal);

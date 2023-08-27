import React, { useState, useEffect } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { img_src, modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_del from 'images/icon_del.svg';
import icon_add from 'images/icon_add.svg';
import icon_close from 'images/icon_close.svg';

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
        <div className="btnbox">
          <Button variant="primary" className="btn_blue">
            저장
          </Button>
          <Button variant="primary" className="btn_close" onClick={onClose}>
            <img src={`${img_src}${icon_close}`} />
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit} id="insert-form">
          <div className="tablebox">
            <table className="thead">
              <thead>
                <th>* 카테고리</th>
                <th>* 상품명</th>
                <th>* 입고단가</th>
                <th>* 택배비</th>
                <th>* 포장비</th>
                <th>박스입수량</th>
                <th>단독배송</th>
                <th>바코드</th>
                <th>권장소비자가</th>
                <th>메모</th>
                <th></th>
              </thead>
            </table>
            <table className="tbody">
              <tbody>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수량" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수량" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수량" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수량" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수량" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수량" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수량" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수량" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수량" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <input type="text" placeholder="카테고리" />
                  </td>
                  <td>
                    <input type="text" placeholder="상품명" />
                  </td>
                  <td>
                    <input type="text" placeholder="입고단가" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        기본값
                      </button>
                    </div>
                    <input type="text" placeholder=""></input>
                  </td>
                  <td>
                    <input type="text" placeholder="박스입수" />
                  </td>
                  <td>
                    <div class="dropdown">
                      <button type="button" class="dropdown-toggle btn">
                        Y
                      </button>
                    </div>
                  </td>
                  <td>
                    <input type="text" placeholder="바코드" />
                  </td>
                  <td>
                    <input type="text" placeholder="권장소비자가" />
                  </td>
                  <td>
                    <input type="text" placeholder="메모" />
                  </td>
                  <td>
                    <button className="btn_del">
                      <img src={`${img_src}${icon_del}`} alt="삭제" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <table className="tfoot">
              <tr>
                <td className="td_btn_add">
                  <span className="txt_small">10행 추가</span>
                  <button className="btn_add btn_on">
                    <img src={`${img_src}${icon_add}`} alt="추가" />
                  </button>
                </td>
              </tr>
            </table>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(InputModal);

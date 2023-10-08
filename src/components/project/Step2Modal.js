import React, { useState, useEffect } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { img_src, modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger, navigate, replace_1000, revert_1000, page_reload } from 'util/com';
import { NumericFormat } from 'react-number-format';

import icon_del from 'images/icon_del.svg';
import icon_add from 'images/icon_add.svg';
import icon_close from 'images/icon_close.svg';

const newRow = {
  delivery_fee: '',
  goods_category: '',
  idx: '',
  memo: '',
  modify_date: '',
  name: '',
  packing_fee: '',
  reg_date: '',
  stock_price: '',
};

const Step2Modal = React.memo(({ modalState, setModalState, callback }) => {
  logger.render('Step2Modal');
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    setTimeout(onReset, 100);
  }, [modalState]);

  const onSubmit = (e) => {
    e.preventDefault();

    const insertRowData = [];

    for (const row of rowData) {
      const goods_category = row.goods_category;
      const name = row.name;
      const stock_price = row.stock_price;
      const delivery_fee = row.delivery_fee;
      const packing_fee = row.packing_fee;

      if (!goods_category && !name) {
        continue;
      } else {
        if (!name) return modal.alert('상품명 항목이 비었습니다.');
        if (!stock_price) return modal.alert('입고단가 항목이 비었습니다.');
        if (delivery_fee != 0 && !delivery_fee) return modal.alert('택배비 항목이 비었습니다.');
        if (packing_fee != 0 && !packing_fee) return modal.alert('포장비 항목이 비었습니다.');
      }

      row.stock_price = revert_1000(row.stock_price);
      row.delivery_fee = revert_1000(row.delivery_fee);
      row.packing_fee = revert_1000(row.packing_fee);
      _.unset(row, 'idx');

      insertRowData.push(row);
    }

    if (insertRowData.length)
      request.post('user/goods/insert', { insert_row_data: insertRowData }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          Recoils.setState('DATA:GOODS', data);

          onClose();
          if (callback) {
            callback();
          }
        }
      });
    else {
      modal.alert('추가할 데이터가 없습니다.');
    }
  };

  const onClose = () => {
    setModalState(false);
  };

  const onReset = () => {
    const initRowData = [];

    for (let i = 0; i < 10; ++i) initRowData.push(_.cloneDeep(newRow));
    setRowData([...initRowData]);
  };

  const onAddRows = () => {
    const addedRowData = [];

    for (let i = 0; i < 10; ++i) addedRowData.push(_.cloneDeep(newRow));
    setRowData([...rowData, ...addedRowData]);
  };

  const onChange = (e, idx) => {
    const { value, name, outerText } = e.target; // 우선 e.target 에서 name 과 value 를 추출
    let index = e.currentTarget.parentNode.parentNode.rowIndex;
    if (index === undefined) {
      index = idx;
    }

    const changeRowData = rowData.slice();
    let chanegeValue;
    if (value !== undefined) {
      chanegeValue = value;
    } else {
      chanegeValue = outerText;
    }

    changeRowData[index][name] = chanegeValue;

    setRowData(changeRowData);
  };

  const onDelete = (e) => {
    const index = e.currentTarget.parentNode.parentNode.rowIndex;

    setRowData(() => rowData.filter((v, i) => i !== index));
  };

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal step2">
      <Modal.Header>
        <Modal.Title>상품추가</Modal.Title>
        <div className="btnbox">
          <Button variant="primary" className="btn_blue" onClick={onSubmit}>
            저장
          </Button>
          <Button variant="primary" className="btn_close" onClick={onClose}>
            <img src={`${img_src}${icon_close}`} />
          </Button>
        </div>
      </Modal.Header>
      <Modal.Body>
        <Form id="insert-form">
          <div className="tablebox">
            <table className="thead">
              <thead>
                <th className="head_red">상품명</th>
                <th>카테고리</th>
                <th className="head_red">입고단가</th>
                <th className="head_red">택배비</th>
                <th className="head_red">포장비</th>
                <th>단독배송</th>
                <th>메모</th>
                <th></th>
              </thead>
            </table>
            <table className="tbody">
              <tbody>
                {rowData &&
                  rowData.map((d, key) => (
                    <InsertGoodsItems index={key} d={d} rowData={rowData} onChange={onChange} onDelete={onDelete} />
                  ))}
              </tbody>
            </table>
            <table className="tfoot">
              <tr>
                <td className="td_btn_add">
                  <span className="txt_small">10행 추가</span>
                  <Button className="btn_add btn_on" onClick={onAddRows}>
                    <img src={`${img_src}${icon_add}`} alt="추가" />
                  </Button>
                </td>
              </tr>
            </table>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
});

const InsertGoodsItems = React.memo(({ index, d, rowData, onChange, onDelete }) => {
  logger.render('InsertGoodsItems TableItem : ', index);

  return (
    <tr>
      <td>
        <input type="text" placeholder="상품명" onChange={onChange} name="name" value={d.name} />
      </td>
      <td>
        <input type="text" placeholder="카테고리" onChange={onChange} name="goods_category" value={d.goods_category} />
      </td>
      <td>
        <NumericFormat
          allowLeadingZeros
          thousandSeparator=","
          placeholder="입고단가"
          onChange={onChange}
          name="stock_price"
          value={d.stock_price}
        />
        <span>원</span>
      </td>

      <td>
        <NumericFormat
          allowLeadingZeros
          thousandSeparator=","
          placeholder="배송비"
          onChange={onChange}
          name="delivery_fee"
          value={d.delivery_fee}
        />
        <span>원</span>
      </td>
      <td>
        <NumericFormat
          allowLeadingZeros
          thousandSeparator=","
          placeholder="포장비"
          onChange={onChange}
          name="packing_fee"
          value={d.packing_fee}
        />
        <span>원</span>
      </td>
      <td>
        <input type="text" placeholder="메모" onChange={onChange} name="memo" value={d.memo} />
      </td>
      <td>
        <Button className="btn_del" onClick={onDelete}>
          <img src={`${img_src}${icon_del}`} alt="삭제" />
        </Button>
      </td>
    </tr>
  );
});

export default React.memo(Step2Modal);

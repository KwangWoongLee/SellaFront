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
import Step2_DFCellRenderer from 'components//common/AgGrid//Step2_DFCellRenderer';
import Step2_PFCellRenderer from 'components/common/AgGrid/Step2_PFCellRenderer';

const newRow = {
  delivery_descript: '',
  delivery_fee: '',
  goods_category: '',
  idx: '',
  memo: '',
  modify_date: '',
  name: '',
  packing_descript: '',
  packing_fee: '',
  reg_date: '',
  single_delivery: 'N',
  stock_price: '',
};

const InputModal = React.memo(({ modalState, setModalState, callback }) => {
  logger.render('Step2Modal');
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    setTimeout(onReset, 100);
  }, [modalState]);

  const onSubmit = (e) => {
    e.preventDefault();

    const insertRowData = [];

    for (const row of rowData) {
      const deliveryData = _.cloneDeep(Recoils.getState('DATA:DELIVERY'));
      if (!deliveryData || deliveryData.length == 1) {
        // GO Step1
        modal.confirm(
          '초기 값을 설정해 주세요.',
          [{ strong: '', normal: '상품정보를 등록하시려면 \n기초정보를 등록해 주세요.' }],
          [
            {
              name: '기초 정보 관리로 이동',
              className: 'red',
              callback: () => {
                navigate('project/Step1');
              },
            },
          ]
        );

        return;
      }

      const packingData = _.cloneDeep(Recoils.getState('DATA:PACKING'));
      if (!packingData || packingData.length == 1) {
        // GO Step1
        modal.confirm(
          '초기 값을 설정해 주세요.',
          [{ strong: '', normal: '상품정보를 등록하시려면 기초정보를 등록해 주세요.' }],
          [
            {
              name: '기초정보 관리로 이동',
              callback: () => {
                navigate('step1');
              },
            },
          ]
        );

        return;
      }

      if (!row.delivery_descript) {
        row.delivery_descript = deliveryData[0].delivery_category;
        row.delivery_fee = deliveryData[0].delivery_fee;
      }

      if (!row.packing_descript) {
        row.packing_descript = packingData[0].packing_category;
        row.packing_fee = Number(packingData[0].packing_fee1) + Number(packingData[0].packing_fee2);
      }

      const goods_category = row.goods_category;
      const name = row.name;
      const stock_price = row.stock_price;
      const delivery_fee = row.delivery_fee;
      const packing_fee = row.packing_fee;

      if (!goods_category && !name) {
        continue;
      } else {
        // if (!goods_category) return modal.alert('카테고리 항목이 비었습니다.');
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
          page_reload();
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

  const onChangeDFRenderer = (e, idx) => {
    const { delivery_descript, delivery_fee } = e.data;

    const changeRowData = rowData.slice();

    changeRowData[idx]['delivery_descript'] = delivery_descript;
    changeRowData[idx]['delivery_fee'] = delivery_fee;

    setRowData(changeRowData);
  };

  const onChangePFRenderer = (e, idx) => {
    const { packing_descript, packing_fee } = e.data;

    const changeRowData = rowData.slice();

    changeRowData[idx]['packing_descript'] = packing_descript;
    changeRowData[idx]['packing_fee'] = packing_fee;

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
                    <InsertGoodsItems
                      index={key}
                      d={d}
                      rowData={rowData}
                      onChange={onChange}
                      onChangeDFRenderer={onChangeDFRenderer}
                      onChangePFRenderer={onChangePFRenderer}
                      onDelete={onDelete}
                    />
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

const InsertGoodsItems = React.memo(
  ({ index, d, rowData, onChange, onChangeDFRenderer, onChangePFRenderer, onDelete }) => {
    logger.render('InsertGoodsItems TableItem : ', index);

    const sd_str = ['Y', 'N'];
    const [sdType, setSDType] = useState(0);

    return (
      <tr>
        <td>
          <input type="text" placeholder="상품명" onChange={onChange} name="name" value={d.name} />
        </td>
        <td>
          <input
            type="text"
            placeholder="카테고리"
            onChange={onChange}
            name="goods_category"
            value={d.goods_category}
          />
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
          <Step2_DFCellRenderer
            onCellValueChanged={(props) => {
              onChangeDFRenderer(props, index);
            }}
            rowData={rowData}
            data={d}
          ></Step2_DFCellRenderer>
        </td>
        <td>
          <Step2_PFCellRenderer
            data={d}
            rowData={rowData}
            onCellValueChanged={(props) => {
              onChangePFRenderer(props, index);
            }}
          ></Step2_PFCellRenderer>
        </td>

        <td>
          <DropdownButton variant="" title={d.single_delivery ? d.single_delivery : sd_str[0]}>
            {sd_str &&
              sd_str.map((item, key) => (
                <Dropdown.Item
                  key={key}
                  eventKey={key}
                  onClick={(e) => {
                    setSDType(key);
                    onChange(e, index);
                  }}
                  active={sdType === key}
                  value={sd_str[key]}
                  name="single_delivery"
                >
                  {sd_str[key]}
                </Dropdown.Item>
              ))}
          </DropdownButton>
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
  }
);

export default React.memo(InputModal);

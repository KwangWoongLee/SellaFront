import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { img_src, modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger, time_format } from 'util/com';

import icon_del from 'images/icon_del.svg';

const GoodsMatchTable = React.memo(({ selectCallback, deleteCallback, changeCallback, parentFormsMatchSelectData }) => {
  logger.render('GoodsMatchTable');
  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    if (!parentFormsMatchSelectData || _.isEmpty(parentFormsMatchSelectData)) {
      return;
    } else {
      setRowData([...parentFormsMatchSelectData.goods_match]);
    }
  }, [parentFormsMatchSelectData]);

  const onDelete = (e, d) => {
    e.preventDefault();
    const newRowData = _.filter(rowData, (item) => {
      return item.idx != d.idx;
    });

    setRowData(newRowData);

    deleteCallback(newRowData);
  };

  const onChange = (e, d, value) => {
    const findObj = _.find(rowData, { idx: d.idx });
    findObj.match_count = Number(value);

    changeCallback(rowData);
  };

  return (
    <>
      <table className="goodsmatchtable thead">
        <thead>
          <tr>
            <th>연결일시</th>
            <th>상품코드</th>
            <th>연결된 상품명</th>
            <th>수량</th>
            {parentFormsMatchSelectData && !parentFormsMatchSelectData.settlement_flag && (
              <th class="td_fee">수수료</th>
            )}
            <th></th>
          </tr>
        </thead>
      </table>
      <table className="goodsmatchtable tbody">
        <tbody>
          <>
            {rowData &&
              rowData.map((d, key) => (
                <GoodsMatchItem
                  key={key}
                  index={key}
                  d={d}
                  rowSpan={rowData.length}
                  onClick={selectCallback}
                  onChange={onChange}
                  onDelete={onDelete}
                  settlement_flag={parentFormsMatchSelectData.settlement_flag}
                  parentFormsMatchSelectData={parentFormsMatchSelectData}
                />
              ))}
          </>
        </tbody>
      </table>
    </>
  );
});

const GoodsMatchItem = React.memo(
  ({ index, d, rowSpan, onClick, onDelete, onChange, settlement_flag, parentFormsMatchSelectData }) => {
    logger.render('GoodsMatchItem : ', index);
    const inputRef = useRef(null);

    useEffect(() => {
      inputRef.current.value = d.match_count;
    }, [d]);

    return (
      <tr>
        <td>{time_format(d.reg_date)}</td>
        <td>{d.idx}</td>
        <td>{d.name}</td>
        <td>
          <>
            <button
              className="btn_number_minus"
              onClick={(e) => {
                if (Number(inputRef.current.value) - 1 < 0) return;
                inputRef.current.value = Number(inputRef.current.value) - 1;
                onChange(e, d, inputRef.current.value);
              }}
            >
              빼기
            </button>
            <input
              type={'number'}
              ref={inputRef}
              defaultValue={d.match_count}
              onChange={(e) => {
                onChange(e, d, inputRef.current.value);
              }}
              className="btn_number"
            ></input>
            <button
              className="btn_number_plus"
              onClick={(e) => {
                inputRef.current.value = Number(inputRef.current.value) + 1;
                onChange(e, d, inputRef.current.value);
              }}
            >
              더하기
            </button>
          </>
        </td>

        {index == 0 ? (
          !settlement_flag && (
            <td class="td_fee" rowSpan={rowSpan}>
              {d.category_fee_rate ? d.category_fee_rate : parentFormsMatchSelectData.category_fee_rate}
            </td>
          )
        ) : (
          <></>
        )}
        <td>
          <button
            className="btn_del"
            onClick={(e) => {
              onDelete(e, d);
            }}
          >
            <img src={`${img_src}${icon_del}`} alt="" />
          </button>
        </td>
      </tr>
    );
  }
);

export default React.memo(GoodsMatchTable);

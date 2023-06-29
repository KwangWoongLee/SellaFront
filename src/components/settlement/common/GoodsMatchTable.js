import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_del from 'images/icon_del.svg';

const GoodsMatchTable = React.memo(({ rows, serverWork, selectCallback, deleteCallback }) => {
  logger.render('GoodsMatchTable');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const sella_categories = Recoils.useValue('SELLA:CATEGORIES');
  const goods = Recoils.useValue('DATA:GOODS');
  const forms_match = Recoils.getState('DATA:FORMSMATCH');
  const aidx = account.aidx;

  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    setRowData([...rows]);
  }, [rows]);

  const onDelete = (e, d) => {
    e.preventDefault();
    if (serverWork) {
      // TODO Server
    } else {
      setRowData(
        _.filter(rowData, (item) => {
          return item.idx != d.idx;
        })
      );
    }
    deleteCallback(d);
  };

  return (
    <>
      <table className="goodsmatchtable thead">
        <thead>
          <tr>
            <th class="td1">연결일시</th>
            <th class="td2">상품코드</th>
            <th class="td3">연결된 상품명</th>
            <th class="td4">수량</th>
            <th class="td5">수수료</th>
            <th class="td6"></th>
          </tr>
        </thead>
      </table>
      <table className="goodsmatchtable tbody">
        <tbody>
          <>
            {rowData &&
              rowData.map((d, key) => (
                <SelectItem key={key} index={key} d={d} onClick={selectCallback} onDelete={onDelete} />
              ))}
          </>
        </tbody>
      </table>
    </>
  );
});

const SelectItem = React.memo(({ index, d, onClick, onDelete }) => {
  logger.render('SelectItem : ', index);
  return (
    <tr>
      <td class="td1">{d.reg_date}</td>
      <td class="td2">{d.idx}</td>
      <td class="td3">{d.name}</td>
      <td class="td4">{d.match_count}</td>
      <td class="td5">{d.category_fee_rate}</td>
      <td class="td6">
        <button
          className="btn_del"
          onClick={(e) => {
            onDelete(e, d);
          }}
        >
          <img src={icon_del} />
        </button>
      </td>
    </tr>
  );
});

export default React.memo(GoodsMatchTable);

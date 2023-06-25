import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

const FormsMatchTable = React.memo(({ rows, serverWork, selectCallback, deleteCallback }) => {
  logger.render('FormsMatchTable');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const sella_categories = Recoils.useValue('SELLA:CATEGORIES');
  const goods = Recoils.useValue('DATA:GOODS');
  const forms_match = Recoils.getState('DATA:FORMSMATCH');
  const aidx = account.aidx;

  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    setRowData([...rows]);
  }, []);

  const onDelete = (e, d) => {
    e.preventDefault();
    if (serverWork) {
      // TODO Server
    } else {
      setRowData(
        _.filter(rowData, (item) => {
          return item.order_no != d.order_no;
        })
      );
    }
    deleteCallback(d);
  };

  return (
    <>
      <div>
        <table className="section">
          <thead>
            <tr>
              <th>주문 매체</th>
              <th>상품명</th>
              <th>옵션</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <>
              {rowData &&
                rowData.map((d, key) => (
                  <SelectItem key={key} index={key} d={d} onClick={selectCallback} onDelete={onDelete} />
                ))}
            </>
          </tbody>
        </table>
      </div>
    </>
  );
});

const SelectItem = React.memo(({ index, d, onClick, onDelete }) => {
  logger.render('SelectItem : ', index);
  return (
    <tr>
      <td onClick={onClick}>{d.name}</td>
      <td onClick={onClick}>{d.forms_product_name}</td>
      <td onClick={onClick}>{d.forms_option_name1}</td>
      <td>
        <button
          className="btn_del"
          onClick={(e) => {
            onDelete(e, d);
          }}
        >
          제거
        </button>
      </td>
    </tr>
  );
});

export default React.memo(FormsMatchTable);

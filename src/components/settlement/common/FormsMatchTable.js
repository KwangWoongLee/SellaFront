import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_del from 'images/icon_del.svg';

const FormsMatchTable = React.memo(({ rows, unconnect_flag, selectCallback, deleteCallback }) => {
  logger.render('FormsMatchTable');

  const [rowData, setRowData] = useState([]);

  useEffect(() => {
    setRowData([...rows]);
  }, []);

  const onDelete = (e, d) => {
    e.preventDefault();
    if (unconnect_flag) {
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
      <table className="formsmatchtable thead">
        <thead>
          <tr>
            <th>주문 매체</th>
            <th>상품명</th>
            <th>옵션</th>
            <th></th>
          </tr>
        </thead>
      </table>
      <table className="formsmatchtable tbody">
        <tbody>
          <>
            {rowData &&
              rowData.map((d, key) => (
                <SelectItem
                  key={key}
                  index={key}
                  d={d}
                  onClick={(e) => {
                    selectCallback(d);
                  }}
                  onDelete={onDelete}
                />
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
      <td onClick={onClick}>{d.forms_name}</td>
      <td onClick={onClick}>{d.forms_product_name}</td>
      <td onClick={onClick}>{d.forms_option_name1}</td>
      <td>
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

export default React.memo(FormsMatchTable);

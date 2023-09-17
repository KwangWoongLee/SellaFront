import React, { useState, useEffect, useRef } from 'react';

import { Table, Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { img_src, logger } from 'util/com';

import icon_del from 'images/icon_del.svg';

const FormsMatchTable = React.memo(
  ({ rows, unconnect_flag, setItems, selectCallback, deleteCallback, onParentSelect, ref }) => {
    logger.render('FormsMatchTable');

    const [rowData, setRowData] = useState([]);
    const [tableRow, setTableRow] = useState(null);
    const formsMatchTableRef = useRef();

    useEffect(() => {
      if (rows) {
        setRowData([...rows]);
      }
    }, [rows]);

    useEffect(() => {
      if (onParentSelect != -1 && rows && rows.length > 0) {
        setTableRow(onParentSelect);
      }

      if (onParentSelect == null) {
        setTableRow(null);
      }
    }, [onParentSelect]);

    const onDelete = (e, d) => {
      e.preventDefault();
      if (unconnect_flag) {
        // TODO Server
      } else {
        deleteCallback(d);
      }
    };

    useEffect(() => {
      if (formsMatchTableRef.current) {
        if (onParentSelect != -1 && rows && rows.length > 0) {
          formsMatchTableRef.current.scrollTop = 10 * onParentSelect;
        }
      }
    });

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
        <table className="formsmatchtable tbody" ref={formsMatchTableRef}>
          <tbody>
            <>
              {rowData &&
                rowData.map((d, key) => (
                  <FormsMatchItem
                    key={key}
                    index={key}
                    d={d}
                    onClick={(e) => {
                      e.preventDefault();
                      const node = e.target.parentNode;

                      setTableRow(node.rowIndex);
                      selectCallback(d);
                    }}
                    onDelete={onDelete}
                    tableRow={tableRow}
                  />
                ))}
            </>
          </tbody>
        </table>
      </>
    );
  }
);

const FormsMatchItem = React.memo(({ index, d, onClick, onDelete, tableRow }) => {
  logger.render('FormsMatchItem : ', index);

  let classNames = [];
  if (index == tableRow) {
    classNames.push('select');
  }

  if (d.save) {
    classNames.push('save_red');
  }

  return (
    <tr className={_.join(classNames, ' ')}>
      <td onClick={onClick}>{d.forms_name}</td>
      <td onClick={onClick}>{d.forms_product_name}</td>
      <td onClick={onClick}>{d.forms_option_name}</td>
      <td>
        <button
          className="btn_del"
          onClick={(e) => {
            onDelete(e, d);
          }}
        >
          <img src={`${img_src}${icon_del}`} />
        </button>
      </td>
    </tr>
  );
});

export default React.memo(FormsMatchTable);

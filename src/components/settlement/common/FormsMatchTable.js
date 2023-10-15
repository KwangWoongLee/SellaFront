import React, { useState, useEffect, useRef } from 'react';
import _ from 'lodash';

import { img_src, logger } from 'util/com';

import icon_del from 'images/icon_del.svg';

const FormsMatchTable = React.memo(({ rows, modalState, selectCallback, deleteCallback, onParentSelect }) => {
  logger.render('FormsMatchTable');

  const [rowData, setRowData] = useState([]);
  const [tableRow, setTableRow] = useState(null);
  const formsMatchTableRef = useRef(null);
  const modalStateParentSelectRef = useRef(null);

  useEffect(() => {
    if (rows) {
      // const noneSavedRows = _.cloneDeep(rows);
      _.forEach(rows, (row) => {
        row.save = false;
      });

      setRowData([...rows]);
    }

    modalStateParentSelectRef.current = onParentSelect;
  }, [modalState]);

  useEffect(() => {
    if (rows) {
      setRowData([...rows]);
    }
  }, [rows]);

  useEffect(() => {
    if (onParentSelect !== null && rows && rows.length > 0) {
      setTableRow(onParentSelect);

      return;
    }

    setTableRow(-1);
  }, [onParentSelect]);

  useEffect(() => {
    if (rowData && rowData[tableRow]) selectCallback(rowData[tableRow]);
  }, [tableRow]);

  const onDelete = (e, d) => {
    e.preventDefault();

    // const filteredRows = _.filter(rowData, (row) => {
    //   return !(row.forms_product_name === d.forms_product_name && row.forms_option_name === d.forms_option_name);
    // });

    deleteCallback(d);
    // setRowData([...filteredRows]);
  };

  useEffect(() => {
    if (formsMatchTableRef.current) {
      if (onParentSelect !== null && rows && rows.length > 0 && modalStateParentSelectRef.current === onParentSelect) {
        formsMatchTableRef.current.scrollTop = 30 * onParentSelect;
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
});

const FormsMatchItem = React.memo(({ index, d, onClick, onDelete, tableRow }) => {
  logger.render('FormsMatchItem : ', index);

  let classNames = [];
  if (index == tableRow && !d.save) {
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

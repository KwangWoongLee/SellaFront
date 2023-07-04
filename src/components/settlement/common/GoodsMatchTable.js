import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { logger } from 'util/com';

import icon_del from 'images/icon_del.svg';

const GoodsMatchTable = React.memo(
  ({ rows, serverWork, selectCallback, deleteCallback, changeCallback, abledCategoryFee }) => {
    logger.render('GoodsMatchTable');
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
      // setRowData(_.cloneDeep(rows));
      setRowData([...rows]);
    }, [rows]);

    const onDelete = (e, d) => {
      e.preventDefault();
      const newRowData = _.filter(rowData, (item) => {
        return item.idx != d.idx;
      });
      if (serverWork) {
        // TODO Server
      } else {
        setRowData(newRowData);
      }
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
                  <GoodsMatchItem
                    key={key}
                    index={key}
                    d={d}
                    onClick={selectCallback}
                    onChange={onChange}
                    onDelete={onDelete}
                    abledCategoryFee={abledCategoryFee}
                  />
                ))}
            </>
          </tbody>
        </table>
      </>
    );
  }
);

const GoodsMatchItem = React.memo(({ index, d, onClick, onDelete, onChange, abledCategoryFee }) => {
  logger.render('GoodsMatchItem : ', index);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.value = d.match_count;
  }, [d]);

  return (
    <tr>
      <td class="td1">{d.reg_date}</td>
      <td class="td2">{d.idx}</td>
      <td class="td3">{d.name}</td>
      <td class="td4">
        <>
          <button
            className="btn_del"
            onClick={(e) => {
              if (Number(inputRef.current.value) - 1 < 0) return;
              inputRef.current.value = Number(inputRef.current.value) - 1;
              onChange(e, d, inputRef.current.value);
            }}
          >
            <img src={icon_del} alt="" />
          </button>
          <input
            type={'number'}
            ref={inputRef}
            defaultValue={d.match_count}
            onChange={(e) => {
              onChange(e, d, inputRef.current.value);
            }}
          ></input>
          <button
            className="btn_del"
            onClick={(e) => {
              inputRef.current.value = Number(inputRef.current.value) + 1;
              onChange(e, d, inputRef.current.value);
            }}
          >
            <img src={icon_del} alt="" />
          </button>
        </>
      </td>
      {/* <td class="td5">{abledCategoryFee ? d.category_fee_rate : 0}</td> */}
      <td class="td6">
        <button
          className="btn_del"
          onClick={(e) => {
            onDelete(e, d);
          }}
        >
          <img src={icon_del} alt="" />
        </button>
      </td>
    </tr>
  );
});

export default React.memo(GoodsMatchTable);

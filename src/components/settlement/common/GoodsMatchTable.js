import React, { useState, useEffect, useRef } from 'react';
import { img_src } from 'util/com';
import _ from 'lodash';

import { logger, time_format } from 'util/com';

import icon_del from 'images/icon_del.svg';

const GoodsMatchTable = React.memo(({ selectCallback, deleteCallback, changeCallback, parentFormsMatchSelectData }) => {
  logger.render('GoodsMatchTable');
  const [rowData, setRowData] = useState([]);
  const [settlementFlag, setSettlementFlag] = useState(false);

  useEffect(() => {
    if (!parentFormsMatchSelectData || _.isEmpty(parentFormsMatchSelectData)) {
      setRowData([]);
    } else {
      if (parentFormsMatchSelectData.settlement_flag) setSettlementFlag(true);
      else setSettlementFlag(false);

      setRowData([...parentFormsMatchSelectData.goods_match]);
    }
  }, [parentFormsMatchSelectData]);

  const onDelete = (e, d) => {
    e.preventDefault();
    const newRowData = _.filter(rowData, (item) => {
      return item.idx !== d.idx;
    });

    setRowData(newRowData);

    deleteCallback(newRowData);
  };

  const onChange = (e, d, value, type) => {
    const findObj = _.find(rowData, { idx: d.idx });
    if (type === 1) {
      findObj.match_count = Number(value);
    } else if (type === 2) findObj.category_fee_rate = Number(value);

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
            {!settlementFlag && <th class="td_fee">수수료</th>}
            <th></th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
      <table className="goodsmatchtable tbody">
        <thead></thead>
        <tbody>
          <>
            {rowData &&
              rowData.map((d, key) => (
                <GoodsMatchItem
                  key={key}
                  index={key}
                  d={d}
                  settlementFlag={settlementFlag}
                  rowSpan={rowData.length}
                  onClick={selectCallback}
                  onChange={onChange}
                  onDelete={onDelete}
                />
              ))}
          </>
        </tbody>
      </table>
    </>
  );
});

const GoodsMatchItem = React.memo(({ index, d, rowSpan, onClick, onDelete, onChange, settlementFlag }) => {
  logger.render('GoodsMatchItem : ', index);
  const inputRef = useRef(null);
  const feeRateRef = useRef(null);

  useEffect(() => {
    inputRef.current.value = d.match_count;
    if (feeRateRef.current) feeRateRef.current.value = d.category_fee_rate;
  });

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
              if (Number(inputRef.current.value) - 1 <= 0) return;
              inputRef.current.value = Number(inputRef.current.value) - 1;
              onChange(e, d, inputRef.current.value, 1);
            }}
          ></button>
          <input
            type={'number'}
            ref={inputRef}
            defaultValue={d.match_count}
            onChange={(e) => {
              onChange(e, d, inputRef.current.value, 1);
            }}
            className="btn_number"
          ></input>
          <button
            className="btn_number_plus"
            onClick={(e) => {
              inputRef.current.value = Number(inputRef.current.value) + 1;
              onChange(e, d, inputRef.current.value, 1);
            }}
          ></button>
        </>
      </td>

      {index === 0 && !settlementFlag && (
        <td class="td_fee" rowSpan={rowSpan}>
          <input
            type={'number'}
            ref={feeRateRef}
            defaultValue={d.category_fee_rate}
            onChange={(e) => {
              onChange(e, d, feeRateRef.current.value, 2);
            }}
          ></input>
          <span>%</span>
        </td>
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
});

export default React.memo(GoodsMatchTable);

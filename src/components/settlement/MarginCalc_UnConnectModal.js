import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import FormsMatchTable from 'components/settlement/common/FormsMatchTable';
import GoodsMatchTable from 'components/settlement/common/GoodsMatchTable';
import CategoryFee_Search from 'components/settlement/common/CategoryFee_Search';
import StandardProduct_Search from 'components/settlement/common/StandardProduct_Search';
import _ from 'lodash';

import { logger } from 'util/com';

import 'styles/MarginCalc_UnConnectModal.scss';

import icon_close from 'images/icon_close.svg';

const MarginCalc_UnConnectModal = React.memo(({ modalState, setModalState, rowData, deleteCallback, saveCallback }) => {
  logger.render('MarginCalc_UnConnectModal');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const nameRef = useRef(null);
  const [abledCategoryFee, setAbledCategoryFee] = useState(true);
  const [items, setItems] = useState([]);
  const [goodsMatch, setGoodsMatchs] = useState([]);
  const [standardItems, setStandardItems] = useState([]);
  const goods_data = [...Recoils.getState('DATA:GOODS')];
  const selectFormsMatchRef = useRef(null);

  useEffect(() => {}, [modalState]);

  useEffect(() => {
    // if (rowData && rowData.length && rowData[0].settlement_price) setAbledCategoryFee(false);
    // else setAbledCategoryFee(true);
    const unconnect_arr = _.filter(rowData, { connect_flag: false });
    const unique_arr = _.uniqBy(unconnect_arr, function (elem) {
      return JSON.stringify(_.pick(elem, ['forms_product_name', 'forms_option_name1']));
    });

    setItems(unique_arr);
  }, [rowData]);

  const onClose = () => {
    setGoodsMatchs([]);
    setStandardItems([]);
    setModalState(false);
  };

  const onSelectFormsMatchTable = (d) => {
    const recommends = _.filter(goods_data, { name: d.forms_product_name });

    selectFormsMatchRef.current = d;

    setStandardItems([...recommends]);
    setGoodsMatchs([...d.goods_match]);
  };
  const onDeleteFormsMatchTable = (d) => {
    setItems(
      _.filter(items, (item) => {
        return item.aggregation != d.aggregation;
      })
    );

    setGoodsMatchs([]);
    setStandardItems([]);

    deleteCallback(d);
  };

  const onSelectGoodsMatchTable = (d) => {};
  const onDeleteGoodsMatchTable = (goods_match) => {
    if (!selectFormsMatchRef.current) return; // TODO error

    selectFormsMatchRef.current.goods_match = [...goods_match];
    selectFormsMatchRef.current.goods_match_idxs = _.transform(
      _.map(goods_match, 'goods_match_idx'),
      function (result, n) {
        result.push(Number(n));
      },
      []
    );
  };
  const onChangeGoodsMatchTable = (goods_match) => {
    if (!selectFormsMatchRef.current) return; // TODO error

    selectFormsMatchRef.current.goods_match = [...goods_match];
  };

  const onSelectStandardProduct_Search = (d) => {
    if (!selectFormsMatchRef.current) return; // TODO error
    if (_.find(selectFormsMatchRef.current.goods_match, { idx: d.idx })) return; // TODO error

    const new_goods_match = { ...d };
    new_goods_match.match_count = 0;

    selectFormsMatchRef.current.goods_match = [...selectFormsMatchRef.current.goods_match, new_goods_match];
    setGoodsMatchs([...selectFormsMatchRef.current.goods_match]);
  };

  const onSelectCategoryFee_Search = (d) => {
    for (const good_match of selectFormsMatchRef.current.goods_match) {
      good_match.category_fee_rate = d.category_fee_rate;
    }

    setGoodsMatchs([...selectFormsMatchRef.current.goods_match]);
  };

  const onSave = (d) => {
    if (!selectFormsMatchRef.current) return; // TODO error

    // setItems();
    //서버보내기
    //성공하면

    request.post(`user/forms/match/unconnect/save`, { aidx, save_data: selectFormsMatchRef.current }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        Recoils.setState('DATA:FORMSMATCH', ret.data.forms_match);
        Recoils.setState('DATA:GOODSMATCH', ret.data.goods_match);

        saveCallback(selectFormsMatchRef.current);
      }
    });
  };

  return (
    <Modal show={modalState} onHide={onClose} centered className="modal UnConnect sale_product">
      <Modal.Header>
        <Modal.Title>상품 매칭 관리</Modal.Title>
        <Button variant="primary" className="btn_close">
          <img src={icon_close} />
        </Button>
      </Modal.Header>
      <Modal.Body>
        <div className="section1">
          <h3>
            미연결 주문 <span>{items.length}</span>
          </h3>
          <FormsMatchTable
            rows={items}
            selectCallback={onSelectFormsMatchTable}
            deleteCallback={onDeleteFormsMatchTable}
          ></FormsMatchTable>
          <h3>연결 상품</h3>
          <button onClick={onSave} className="btn_blue btn-primary">
            저장
          </button>
          <GoodsMatchTable
            rows={goodsMatch}
            selectCallback={onSelectGoodsMatchTable}
            deleteCallback={onDeleteGoodsMatchTable}
            changeCallback={onChangeGoodsMatchTable}
            abledCategoryFee={abledCategoryFee}
          ></GoodsMatchTable>
        </div>
        <div className="section2">
          <h3>연결할 기준 상품 검색</h3>
          <StandardProduct_Search
            rows={standardItems}
            selectCallback={onSelectStandardProduct_Search}
          ></StandardProduct_Search>
          <h3>수수료 검색</h3>
          <CategoryFee_Search
            abledCategoryFee={abledCategoryFee}
            selectCallback={onSelectCategoryFee_Search}
          ></CategoryFee_Search>
        </div>
      </Modal.Body>
    </Modal>
  );
});

export default React.memo(MarginCalc_UnConnectModal);

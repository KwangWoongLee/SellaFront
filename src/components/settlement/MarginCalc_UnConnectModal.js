import React, { useState, useEffect, useRef } from 'react';

import { Button, Modal, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { img_src, modal } from 'util/com';
import Recoils from 'recoils';
import FormsMatchTable from 'components/settlement/common/FormsMatchTable';
import GoodsMatchTable from 'components/settlement/common/GoodsMatchTable';
import CategoryFee_Search from 'components/settlement/common/CategoryFee_Search';
import StandardProduct_Search from 'components/settlement/common/StandardProduct_Search';
import _ from 'lodash';
import Step2Modal from 'components/project/Step2Modal';

import { logger } from 'util/com';

import 'styles/MarginCalc_UnConnectModal.scss';

import icon_close from 'images/icon_close.svg';

const MarginCalc_UnConnectModal = React.memo(
  ({ modalState, setModalState, rowData, deleteCallback, saveCallback, selectData }) => {
    const [formsMatchSelect, setFormsMatchSelect] = useState(-1);
    const [items, setItems] = useState([]);
    const selectFormsMatchRef = useRef(null);
    const [selectFormsMatchData, setSelectFormsMatchData] = useState(null);
    const [step2ModalState, setStep2ModalState] = useState(false);

    const insertedDataRef = useRef(null);
    const saveFormsMatchRef = useRef(null);
    const noUpdateRef = useRef(null);

    useEffect(() => {
      if (!modalState) return;

      const unconnect_arr = _.filter(_.cloneDeep(rowData), { connect_flag: false });
      const unique_arr = _.uniqBy(unconnect_arr, function (elem) {
        return JSON.stringify(_.pick(elem, ['forms_product_name', 'forms_option_name']));
      });

      const state_change_arr = _.filter(_.cloneDeep(rowData), { state_change_flag: true });
      for (const sca of state_change_arr) {
        sca.state_change_flag = false;
      }

      const unique_state_change_arr = _.uniqBy(state_change_arr, function (elem) {
        return JSON.stringify(_.pick(elem, ['forms_product_name', 'forms_option_name']));
      });

      if (unique_state_change_arr.length) {
        unique_arr.concat(unique_state_change_arr);
      }

      saveFormsMatchRef.current = new Array(unique_arr.length);

      const select_row_index = _.findIndex(unique_arr, (row) => {
        return (
          row.forms_product_name == selectData.forms_product_name &&
          row.forms_option_name == selectData.forms_option_name
        );
      });

      if (select_row_index !== -1) {
        var pulled = _.pullAt(unique_arr, [select_row_index]);
        if (pulled) {
          unique_arr.unshift(pulled[0]);
        }
      }

      noUpdateRef.current = true;
      selectFormsMatchRef.current = unique_arr[0];
      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
      setFormsMatchSelect(0);

      setItems([...unique_arr]);
    }, [modalState]);

    // useEffect(() => {
    //   if (selectFormsMatchRef.current) setItems([...items]);
    // }, [selectFormsMatchRef.current]);

    const onClose = () => {
      selectFormsMatchRef.current = null;
      setSelectFormsMatchData(null);
      setModalState(false);
    };

    const onSelectFormsMatchTable = (d) => {
      if (noUpdateRef.current === true) {
        noUpdateRef.current = false;
        return;
      }

      const select_row_index = _.findIndex(items, (row) => {
        return row.forms_product_name == d.forms_product_name && row.forms_option_name == d.forms_option_name;
      });

      if (select_row_index != -1) {
        selectFormsMatchRef.current = items[select_row_index];
        // selectFormsMatchRef.current.settlement_flag = findForm.settlement_flag;

        // setFormsMatchSelect(select_row_index);
        setSelectFormsMatchData({ ...selectFormsMatchRef.current });
      } else {
        setFormsMatchSelect(-1);
      }
    };

    const onDeleteFormsMatchTable = (d) => {
      const filtered_items = _.filter(items, (item) => {
        return item.idx != d.idx;
      });
      setItems([...filtered_items]);

      deleteCallback(d, false);

      if (filtered_items.length === 0) {
        setModalState(false);
      }

      setFormsMatchSelect(-1);
      selectFormsMatchRef.current = null;
      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
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

      if (!selectFormsMatchRef.current.goods_match.length) {
        selectFormsMatchRef.current.save = false;
        saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = null;
      }

      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
    };

    const onChangeGoodsMatchTable = (goods_match) => {
      if (!selectFormsMatchRef.current) return; // TODO error

      selectFormsMatchRef.current.goods_match = [...goods_match];
      saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
    };

    const onSelectStandardProduct_Search = (d) => {
      if (!selectFormsMatchRef.current) return; // TODO error
      const findObj = _.find(selectFormsMatchRef.current.goods_match, { idx: d.idx });
      if (findObj) {
        modal.alert('이미 추가된 상품입니다.');
        return; // TODO error
      }

      const new_goods_match = { ...d };
      new_goods_match.match_count = 1;
      new_goods_match.category_fee_rate = selectFormsMatchRef.current.category_fee_rate
        ? Number(selectFormsMatchRef.current.category_fee_rate)
        : 0;

      selectFormsMatchRef.current.goods_match = [...selectFormsMatchRef.current.goods_match, new_goods_match];

      _.forEach(selectFormsMatchRef.current.goods_match, (goods_match) => {
        goods_match.reg_date = new Date(Date.now());
      });

      if (selectFormsMatchRef.current.goods_match.length) {
        selectFormsMatchRef.current.save = true;
        saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
      }
      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
    };

    const onUnSelectStandardProduct_Search = (d) => {
      if (!selectFormsMatchRef.current) return; // TODO error
      _.remove(selectFormsMatchRef.current.goods_match, (goods_match) => {
        return goods_match.idx == d.idx;
      });

      onDeleteGoodsMatchTable(selectFormsMatchRef.current.goods_match);
    };

    const onSelectCategoryFee_Search = (d) => {
      if (!selectFormsMatchRef.current) return; // TODO error

      for (const good_match of selectFormsMatchRef.current.goods_match) {
        good_match.category_fee_rate = Number(d.category_fee_rate).toFixed(2);
      }

      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
    };

    const onSave = () => {
      const save_datas = _.filter(saveFormsMatchRef.current, (item) => {
        return item;
      });

      if (!save_datas || !save_datas.length) {
        modal.alert('저장할 데이터가 없습니다.');
        return; // TODO error
      }

      request.post(`user/forms/match/unconnect/save`, { save_datas }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;

          Recoils.setState('DATA:FORMSMATCH', data.forms_match);
          Recoils.setState('DATA:GOODSMATCH', data.goods_match);

          saveCallback(save_datas, data.forms_match, true);

          const saved_idxs = _.map(save_datas, 'idx');

          const unsaved_items = _.filter(items, (item) => {
            return !_.includes(saved_idxs, item.idx);
          });

          saveFormsMatchRef.current = new Array(unsaved_items.length);
          setItems([...unsaved_items]);

          if (unsaved_items.length === 0) {
            setModalState(false);
          }

          setFormsMatchSelect(-1);
          setSelectFormsMatchData(null);
        }
      });
    };

    return (
      <>
        <Modal
          show={modalState}
          onHide={onClose}
          style={{ position: 'relative', zIndex: '1050' }}
          centered
          className="modal UnConnect sale_product"
        >
          <Modal.Header>
            <Modal.Title>상품 매칭 관리</Modal.Title>
            <Button variant="primary" className="btn_close" onClick={onClose}>
              <img src={`${img_src}${icon_close}`} />
            </Button>
            <button
              onClick={() => {
                setStep2ModalState(true);
              }}
              className=" btn-primary btn_save"
            >
              상품 추가
            </button>
          </Modal.Header>
          <Modal.Body>
            <div className="section1">
              <h3>
                미연결 주문 <span>{items.length}</span>
              </h3>
              <button onClick={onSave} className="btn_blue btn-primary btn_save">
                전체 저장
              </button>
              <FormsMatchTable
                rows={items}
                modalState={modalState}
                selectCallback={onSelectFormsMatchTable}
                deleteCallback={onDeleteFormsMatchTable}
                onParentSelect={formsMatchSelect}
              ></FormsMatchTable>
              <h3>연결 상품</h3>

              <GoodsMatchTable
                selectCallback={onSelectGoodsMatchTable}
                deleteCallback={onDeleteGoodsMatchTable}
                changeCallback={onChangeGoodsMatchTable}
                parentFormsMatchSelectData={selectFormsMatchData}
              ></GoodsMatchTable>
            </div>
            <div className="section2">
              <h3>연결할 기준 상품 검색</h3>
              <StandardProduct_Search
                selectCallback={onSelectStandardProduct_Search}
                unSelectCallback={onUnSelectStandardProduct_Search}
                parentFormsMatchSelectData={selectFormsMatchData}
                insertedData={insertedDataRef.current}
              ></StandardProduct_Search>
              <h3>수수료 검색</h3>
              <CategoryFee_Search
                selectCallback={onSelectCategoryFee_Search}
                parentFormsMatchSelectData={selectFormsMatchData}
              ></CategoryFee_Search>
            </div>
          </Modal.Body>
        </Modal>

        <Step2Modal
          modalState={step2ModalState}
          setModalState={setStep2ModalState}
          callback={(insertedData) => {
            insertedDataRef.current = insertedData;
            setSelectFormsMatchData({ ...selectFormsMatchRef.current });
            setFormsMatchSelect(-1);
          }}
        ></Step2Modal>
      </>
    );
  }
);

export default React.memo(MarginCalc_UnConnectModal);

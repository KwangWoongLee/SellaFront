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
    logger.render('MarginCalc_UnConnectModal');

    const [formsMatchSelect, setFormsMatchSelect] = useState(-1);
    const [items, setItems] = useState([]);
    const forms = _.cloneDeep(Recoils.getState('DATA:PLATFORMS'));
    const selectFormsMatchRef = useRef(null);
    const [selectFormsMatchData, setSelectFormsMatchData] = useState(null);
    const [step2ModalState, setStep2ModalState] = useState(false);

    const saveFormsMatchRef = useRef(null);

    useEffect(() => {
      const unconnect_arr = _.filter(rowData, { connect_flag: false });
      const unique_arr = _.uniqBy(unconnect_arr, function (elem) {
        return JSON.stringify(_.pick(elem, ['forms_product_name', 'forms_option_name']));
      });

      saveFormsMatchRef.current = new Array(unique_arr.length);
      setItems([...unique_arr]);
    }, [rowData]);

    useEffect(() => {
      if (!selectData || _.isEmpty(selectData)) {
        setSelectFormsMatchData(null);
        return;
      }

      const select_row_index = _.findIndex(items, (row) => {
        return (
          row.forms_product_name == selectData.forms_product_name &&
          row.forms_option_name == selectData.forms_option_name
        );
      });

      if (select_row_index != -1) {
        selectFormsMatchRef.current = items[select_row_index];

        setFormsMatchSelect(select_row_index);
        setSelectFormsMatchData({ ...selectFormsMatchRef.current });
      }
    }, [selectData]);

    const onClose = () => {
      selectFormsMatchRef.current = null;
      setSelectFormsMatchData(null);
      setModalState(false);
    };

    const onSelectFormsMatchTable = (d) => {
      selectFormsMatchRef.current = d;

      const findForm = _.find(forms, { idx: d.forms_idx });
      if (!findForm) {
        return;
      }
      selectFormsMatchRef.current.settlement_flag = findForm.settlement_flag;

      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
      // setFormsMatchSelect(-1);
    };

    const onDeleteFormsMatchTable = (d) => {
      const filtered_items = _.filter(items, (item) => {
        return item.idx != d.idx;
      });
      setItems(filtered_items);

      deleteCallback(d, false);

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

      selectFormsMatchRef.current.goods_match = [...selectFormsMatchRef.current.goods_match, new_goods_match];

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
          logger.info(data);

          Recoils.setState('DATA:FORMSMATCH', data.forms_match);
          Recoils.setState('DATA:GOODSMATCH', data.goods_match);

          saveCallback(save_datas, data.forms_match, true);
          setFormsMatchSelect(null);
          setSelectFormsMatchData(null);
        }
      });
    };

    return (
      <>
        <Modal show={modalState} onHide={onClose} centered className="modal UnConnect sale_product">
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
            <button onClick={onSave} className="btn_blue btn-primary btn_save">
              전체 저장
            </button>
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
          callback={() => {
            setSelectFormsMatchData({ ...selectFormsMatchRef.current });
            setFormsMatchSelect(-1);
          }}
        ></Step2Modal>
      </>
    );
  }
);

export default React.memo(MarginCalc_UnConnectModal);

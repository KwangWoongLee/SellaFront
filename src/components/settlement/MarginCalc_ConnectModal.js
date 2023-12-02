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

const MarginCalc_ConnectModal = React.memo(
  ({ modalState, setModalState, rowData, deleteCallback, saveCallback, selectData }) => {
    //logger.debug('MarginCalc_ConnectModal');

    const [formsMatchSelect, setFormsMatchSelect] = useState(-1);
    const [items, setItems] = useState([]);
    let rawGoodsMatch = Recoils.getState('DATA:GOODSMATCH');
    const selectFormsMatchRef = useRef(null);
    const [selectFormsMatchData, setSelectFormsMatchData] = useState(null);
    const [step2ModalState, setStep2ModalState] = useState(false);

    const saveFormsMatchRef = useRef(null);
    const noUpdateRef = useRef(null);
    const insertedDataRef = useRef(null);

    useEffect(() => {
      if (!modalState) return;

      rawGoodsMatch = Recoils.getState('DATA:GOODSMATCH');

      const connect_arr = _.filter(_.cloneDeep(rowData), { connect_flag: true });
      const unique_arr = _.uniqBy(connect_arr, function (elem) {
        return JSON.stringify(_.pick(elem, ['forms_product_name', 'forms_option_name']));
      });

      saveFormsMatchRef.current = new Array(unique_arr.length);

      const select_row_index = _.findIndex(unique_arr, (row) => {
        return (
          row.forms_product_name == selectData.forms_product_name &&
          row.forms_option_name == selectData.forms_option_name
        );
      });

      var pulled = _.pullAt(unique_arr, [select_row_index]);
      if (pulled) {
        unique_arr.unshift(pulled[0]);
      }

      noUpdateRef.current = true;
      selectFormsMatchRef.current = unique_arr[0];
      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
      setFormsMatchSelect(0);

      setItems([...unique_arr]);
    }, [modalState]);

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

        setSelectFormsMatchData({ ...selectFormsMatchRef.current });
      } else {
        setFormsMatchSelect(-1);
      }
    };

    const onDeleteFormsMatchTable = (d) => {
      request.post(`user/forms/match/delete`, { forms_match_idx: d.forms_match_idx }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);

          Recoils.setState('DATA:FORMSMATCH', data.forms_match);
          Recoils.setState('DATA:GOODSMATCH', data.goods_match);

          deleteCallback(d, true);

          rawGoodsMatch = _.cloneDeep(data.goods_match);

          const filteredArr = _.filter(_.cloneDeep(items), (item) => item.forms_match_idx !== d.forms_match_idx);

          saveFormsMatchRef.current = new Array(filteredArr.length);

          if (filteredArr.length) {
            setFormsMatchSelect(-1);

            selectFormsMatchRef.current = null;
            setSelectFormsMatchData({ ...selectFormsMatchRef.current });
          }

          setItems([...filteredArr]);
        }
      });
    };

    const onSelectGoodsMatchTable = (d) => {};

    const onDeleteGoodsMatchTable = (d) => {
      if (!selectFormsMatchRef.current) return; // TODO error

      const findRawObj = _.find(rawGoodsMatch, (data) => {
        return data.forms_match_idx === selectFormsMatchRef.current.forms_match_idx && data.goods_idx === d.idx;
      });

      _.remove(selectFormsMatchRef.current.goods_match, (goods_match) => {
        return goods_match.idx == d.idx;
      });

      setSelectFormsMatchData({ ...selectFormsMatchRef.current });

      if (findRawObj) {
        request.post(`user/goods/match/delete`, { delete_data: findRawObj }).then((ret) => {
          if (!ret.err) {
            const { data } = ret.data;
            logger.info(data);

            Recoils.setState('DATA:FORMSMATCH', data.forms_match);
            Recoils.setState('DATA:GOODSMATCH', data.goods_match);

            rawGoodsMatch = _.cloneDeep(data.goods_match);

            const real_data = _.filter(rawGoodsMatch, (data) => {
              return data.forms_match_idx === selectFormsMatchRef.current.forms_match_idx && data.idx;
            });
            if (!real_data.length) {
              deleteCallback(selectFormsMatchRef.current, true);

              setItems(() =>
                _.filter(items, (item) => {
                  return item.forms_match_idx !== selectFormsMatchRef.current.forms_match_idx;
                })
              );

              setFormsMatchSelect(-1);

              selectFormsMatchRef.current = null;
              setSelectFormsMatchData({ ...selectFormsMatchRef.current });

              return;
            }
          }
        });
      }
    };

    const onChangeGoodsMatchTable = (goods_match) => {
      if (!selectFormsMatchRef.current) return; // TODO error

      let diff_goods_match = [];
      if (rawGoodsMatch && goods_match) {
        diff_goods_match = _.cloneDeep(
          _.differenceWith(goods_match, rawGoodsMatch, (current_goods_match_data, raw_current_goods_match_data) => {
            return !(
              raw_current_goods_match_data.goods_idx !== current_goods_match_data.idx ||
              raw_current_goods_match_data.match_count !== current_goods_match_data.match_count ||
              (current_goods_match_data.category_fee_rate &&
                raw_current_goods_match_data.category_fee_rate !== current_goods_match_data.category_fee_rate)
            );
          })
        );
      }

      if (diff_goods_match && diff_goods_match.length) {
        selectFormsMatchRef.current.save = true;

        for (const diff_data of diff_goods_match) {
          diff_data.reg_date = new Date(Date.now());

          const findObj = _.find(selectFormsMatchRef.current.goods_match, {
            idx: diff_data.idx,
          });

          let findRawObj = _.find(rawGoodsMatch, (data) => {
            return (
              data.forms_match_idx == selectFormsMatchRef.current.forms_match_idx && data.goods_idx == diff_data.idx
            );
          });

          if (findObj) {
            findObj.goods_match_idx = findRawObj.idx;
            diff_data.new = false;
          } else {
            diff_data.new = true;
            selectFormsMatchRef.current.goods_match.push(diff_data);
          }
        }

        saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
      } else {
        selectFormsMatchRef.current.save = false;
        saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = null;
      }

      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
    };

    const onSelectStandardProduct_Search = (d) => {
      if (!selectFormsMatchRef.current) return; // TODO error
      const findObj = _.find(selectFormsMatchRef.current.goods_match, { idx: d.idx });
      if (findObj) {
        modal.alert('이미 추가된 상품입니다.');
        return; // TODO error
      }

      let findRawObj = _.cloneDeep(
        _.find(rawGoodsMatch, (data) => {
          return data.forms_match_idx == selectFormsMatchRef.current.forms_match_idx && data.goods_idx == d.idx;
        })
      );

      let new_goods_match = { ...d };
      if (findRawObj) {
        new_goods_match = { ...new_goods_match, findRawObj };
      }
      new_goods_match.match_count = 1;
      new_goods_match.reg_date = new Date(Date.now());
      if (selectFormsMatchRef.current.goods_match.length) {
        new_goods_match.category_fee_rate = Number(selectFormsMatchRef.current.goods_match[0].category_fee_rate);
      } else {
        new_goods_match.category_fee_rate = selectFormsMatchRef.current.category_fee_rate
          ? Number(selectFormsMatchRef.current.category_fee_rate)
          : 0;
      }

      selectFormsMatchRef.current.goods_match = [...selectFormsMatchRef.current.goods_match, new_goods_match];

      if (rawGoodsMatch) {
        const findRawFormsMatch = _.find(rawGoodsMatch, (raw_goods_match) => {
          return raw_goods_match.forms_match_idx === selectFormsMatchRef.current.forms_match_idx;
        });
        if (findRawFormsMatch) {
          if (!findRawObj) {
            selectFormsMatchRef.current.save = true;
            saveFormsMatchRef.current = new Array(rawGoodsMatch.length);
          }
        }
      }

      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
    };

    const onUnSelectStandardProduct_Search = (d) => {
      if (!selectFormsMatchRef.current) return; // TODO error

      onDeleteGoodsMatchTable(d);
    };

    const onSelectCategoryFee_Search = (d) => {
      if (!selectFormsMatchRef.current) return;

      for (const good_match of selectFormsMatchRef.current.goods_match) {
        good_match.category_fee_rate = Number(d.category_fee_rate).toFixed(2);
      }

      setSelectFormsMatchData({ ...selectFormsMatchRef.current });
    };

    const onSave = () => {
      const save_datas = _.filter(saveFormsMatchRef.current, (item) => {
        return item && !item.delete && item.save;
      });

      if (save_datas && save_datas.length) {
        request.post(`user/forms/match/save`, { save_datas }).then((ret) => {
          if (!ret.err) {
            const { data } = ret.data;
            logger.info(data);

            Recoils.setState('DATA:FORMSMATCH', data.forms_match);
            Recoils.setState('DATA:GOODSMATCH', data.goods_match);

            saveCallback(save_datas, data.forms_match);

            const saved_idxs = _.map(save_datas, 'idx');

            _.forEach(items, (item) => {
              if (_.includes(saved_idxs, item.idx)) {
                item.save = false;
                item.delete = false;
              }
            });
            rawGoodsMatch = _.cloneDeep(data.goods_match);

            saveFormsMatchRef.current = new Array(saved_idxs.length);
            setItems([...items]);

            setFormsMatchSelect(-1);
            selectFormsMatchRef.current = null;
            setSelectFormsMatchData({ ...selectFormsMatchRef.current });
          }
        });
      }
    };

    return (
      <>
        <Modal show={modalState} onHide={onClose} centered className="modal UnConnect sale_product">
          <Modal.Header>
            <Modal.Title>상품 매칭 관리</Modal.Title>
            <Button variant="primary" className="btn_close" onClick={onClose}>
              <img src={`${img_src}${icon_close}`} />
            </Button>
            <Button
              onClick={() => {
                setStep2ModalState(true);
              }}
              className=" btn-primary btn_save"
            >
              상품 추가
            </Button>
          </Modal.Header>
          <Modal.Body>
            <div className="section1">
              <h3>
                연결 주문 <span>{items.length}</span>
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

export default React.memo(MarginCalc_ConnectModal);

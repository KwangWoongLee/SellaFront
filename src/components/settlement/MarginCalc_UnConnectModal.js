import React, { useState, useEffect, useRef } from 'react';

import { Button, DropdownButton, Dropdown, Modal, Form, FloatingLabel } from 'react-bootstrap';
import request from 'util/request';
import { img_src, modal } from 'util/com';
import Recoils from 'recoils';
import FormsMatchTable from 'components/settlement/common/FormsMatchTable';
import GoodsMatchTable from 'components/settlement/common/GoodsMatchTable';
import CategoryFee_Search from 'components/settlement/common/CategoryFee_Search';
import StandardProduct_Search from 'components/settlement/common/StandardProduct_Search';
import _ from 'lodash';

import { logger } from 'util/com';

import 'styles/MarginCalc_UnConnectModal.scss';

import icon_close from 'images/icon_close.svg';

const MarginCalc_UnConnectModal = React.memo(
  ({ modalState, setModalState, rowData, deleteCallback, saveCallback, selectData }) => {
    logger.render('MarginCalc_UnConnectModal');

    const [formsMatchSelect, setFormsMatchSelect] = useState(-1);
    const [abledCategoryFee, setAbledCategoryFee] = useState(true);
    const [items, setItems] = useState([]);
    const [goodsMatch, setGoodsMatchs] = useState([]);
    const [standardItems, setStandardItems] = useState([]);
    const goods_data = [...Recoils.getState('DATA:GOODS')];
    const selectFormsMatchRef = useRef(null);

    useEffect(() => {
      // if (rowData && rowData.length && rowData[0].settlement_price) setAbledCategoryFee(false);
      // else setAbledCategoryFee(true);
      const unconnect_arr = _.filter(rowData, { connect_flag: false });
      const unique_arr = _.uniqBy(unconnect_arr, function (elem) {
        return JSON.stringify(_.pick(elem, ['forms_product_name', 'forms_option_name1']));
      });

      setItems(unique_arr);
    }, [rowData]);

    useEffect(() => {
      if (!selectData || !selectData.data) return;

      const unconnect_arr = _.filter(rowData, { connect_flag: false });
      const unique_arr = _.uniqBy(unconnect_arr, function (elem) {
        return JSON.stringify(_.pick(elem, ['forms_product_name', 'forms_option_name1']));
      });

      const select_row_index = _.findIndex(unique_arr, (row) => {
        return (
          row.forms_product_name == selectData.data.forms_product_name &&
          row.forms_option_name == selectData.data.forms_option_name
        );
      });

      if (select_row_index != -1) {
        setFormsMatchSelect(select_row_index);
        let recommends = _.filter(goods_data, { name: selectData.data.forms_product_name });

        if (recommends.length == 0) {
          recommends = [...Recoils.getState('DATA:GOODS')];
        }

        selectFormsMatchRef.current = selectData.data;

        setStandardItems([...recommends]);
      }
    }, [selectData]);

    useEffect(() => {
      const standards = _.cloneDeep(standardItems);

      const goods_match_selects = _.map(goodsMatch, 'name');
      for (const standard of standards) {
        if (_.includes(goods_match_selects, standard.name)) {
          standard.select = true;
        } else {
          standard.select = false;
        }
      }

      setStandardItems(standards);
    }, [goodsMatch]);

    const onClose = () => {
      setGoodsMatchs([]);
      setStandardItems([]);
      setModalState(false);
    };

    const onSelectFormsMatchTable = (d) => {
      let recommends = _.filter(goods_data, { name: d.forms_product_name });

      if (recommends.length == 0) {
        recommends = [...Recoils.getState('DATA:GOODS')];
      }

      selectFormsMatchRef.current = d;

      setStandardItems([...recommends]);
      setGoodsMatchs([...d.goods_match]);
      setFormsMatchSelect(-1);
    };
    const onDeleteFormsMatchTable = (d) => {
      const filtered_items = _.filter(items, (item) => {
        return item.idx != d.idx;
      });
      setItems(filtered_items);

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

      setGoodsMatchs([...selectFormsMatchRef.current.goods_match]);
    };
    const onChangeGoodsMatchTable = (goods_match) => {
      if (!selectFormsMatchRef.current) return; // TODO error

      selectFormsMatchRef.current.goods_match = [...goods_match];
    };

    const onSelectStandardProduct_Search = (d) => {
      if (!selectFormsMatchRef.current) return; // TODO error
      if (_.find(selectFormsMatchRef.current.goods_match, { idx: d.idx })) return; // TODO error

      const new_goods_match = { ...d };
      new_goods_match.match_count = 1;

      selectFormsMatchRef.current.goods_match = [...selectFormsMatchRef.current.goods_match, new_goods_match];
      setGoodsMatchs([...selectFormsMatchRef.current.goods_match]);
    };

    const onUnSelectStandardProduct_Search = (d) => {
      if (!selectFormsMatchRef.current) return; // TODO error
      _.remove(selectFormsMatchRef.current.goods_match, (goods_match) => {
        return goods_match.idx == d.idx;
      });

      onDeleteGoodsMatchTable(selectFormsMatchRef.current.goods_match);
      setGoodsMatchs([...selectFormsMatchRef.current.goods_match]);
    };

    const onSelectCategoryFee_Search = (d) => {
      if (!selectFormsMatchRef.current) return; // TODO error

      for (const good_match of selectFormsMatchRef.current.goods_match) {
        good_match.category_fee_rate = d.category_fee_rate;
      }

      setGoodsMatchs([...selectFormsMatchRef.current.goods_match]);
    };

    const onResetStandardProduct_Search = () => {
      selectFormsMatchRef.current = null;

      setGoodsMatchs([]);
      setStandardItems([]);
      setFormsMatchSelect(null);
      //카테고리도 해야한다. 수수료 데이터 넘겨받으면 그때!
    };

    const onSave = (d) => {
      if (!selectFormsMatchRef.current) {
        modal.alert('왼쪽에서 미연결 주문을 선택하세요.');
        return; // TODO error
      }

      if (!selectFormsMatchRef.current.goods_match || selectFormsMatchRef.current.goods_match.length == 0) {
        modal.alert('오른쪽에서 연결할 기준 상품을 선택하세요.');
        return; // TODO error
      }

      let first = true;
      let firstRate;
      for (const good_match of selectFormsMatchRef.current.goods_match) {
        if (first && !good_match.category_fee_rate) {
          modal.alert('오른쪽에서 연결할 상품의 수수료를 선택해주세요.');
          return;
        } else if (first && good_match.category_fee_rate) {
          first = false;
          firstRate = good_match.category_fee_rate;
          selectFormsMatchRef.current.category_fee_rate = firstRate;
          continue;
        }

        if (!good_match.category_fee_rate) {
          good_match.category_fee_rate = firstRate;
        }
      }

      request.post(`user/forms/match/unconnect/save`, { save_data: selectFormsMatchRef.current }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);

          Recoils.setState('DATA:FORMSMATCH', data.forms_match);
          Recoils.setState('DATA:GOODSMATCH', data.goods_match);

          saveCallback(selectFormsMatchRef.current);

          setGoodsMatchs([]);
          setStandardItems([]);
          setFormsMatchSelect(null);
        }
      });
    };

    return (
      <Modal show={modalState} onHide={onClose} centered className="modal UnConnect sale_product">
        <Modal.Header>
          <Modal.Title>상품 매칭 관리</Modal.Title>
          <Button variant="primary" className="btn_close" onClick={onClose}>
            <img src={`${img_src}${icon_close}`} />
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
              onParentSelect={formsMatchSelect}
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
              resetCallback={onResetStandardProduct_Search}
              unSelectCallback={onUnSelectStandardProduct_Search}
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
  }
);

export default React.memo(MarginCalc_UnConnectModal);

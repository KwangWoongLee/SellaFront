import React, { useState, useEffect, useRef } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal } from 'util/com';
import request from 'util/request';
import FormManagementNavTab from 'components/settlement/common/FormManagementNavTab';
import FormsMatchTable from 'components/settlement/common/FormsMatchTable';
import GoodsMatchTable from 'components/settlement/common/GoodsMatchTable';
import CategoryFee_Search from 'components/settlement/common/CategoryFee_Search';
import StandardProduct_Search from 'components/settlement/common/StandardProduct_Search';

import { logger } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import 'styles/SaleProduct.scss';

const SaleProduct = () => {
  logger.render('SaleProduct');

  const [items, setItems] = useState([]);
  const [formsMatchSelect, setFormsMatchSelect] = useState(null);
  const forms = _.cloneDeep(Recoils.getState('DATA:PLATFORMS'));
  const forms_match = _.cloneDeep(Recoils.getState('DATA:FORMSMATCH'));
  const goods_match = _.cloneDeep(Recoils.getState('DATA:GOODSMATCH'));
  const goods_data = [...Recoils.getState('DATA:GOODS')];

  const selectFormsMatchRef = useRef(null);
  const [selectFormsMatchData, setSelectFormsMatchData] = useState();

  const saveFormsMatchRef = useRef(null);

  useEffect(() => {
    for (const match_data of forms_match) {
      match_data.goods_match = [];
      match_data.forms_option_name = `${match_data.forms_option_name1}`;
      match_data.forms_option_name += match_data.forms_option_name2 ? `\n${match_data.forms_option_name2}` : '';
      match_data.forms_option_name += match_data.forms_option_name3 ? `\n${match_data.forms_option_name3}` : '';

      for (const goods_match_idx of match_data.goods_match_idxs) {
        const findGoodsMatchObj = _.find(goods_match, { idx: Number(goods_match_idx) });
        if (!findGoodsMatchObj) continue;
        const findObj = _.find(goods_data, { idx: Number(findGoodsMatchObj.goods_idx) });
        if (!findObj) continue;
        const goods = {
          ...findObj,
          category_fee_rate: findGoodsMatchObj.category_fee_rate,
          match_count: findGoodsMatchObj.match_count,
          goods_match_idx: Number(goods_match_idx),
        };
        match_data.goods_match.push(goods);
      }
    }

    setItems([...forms_match]);
  }, []);

  useEffect(() => {
    saveFormsMatchRef.current = new Array(items.length);
  }, [items]);

  const onSelectFormsMatchTable = (d) => {
    selectFormsMatchRef.current = d;

    const findForm = _.find(forms, { idx: d.forms_idx });
    if (!findForm) {
      return;
    }
    selectFormsMatchRef.current.settlement_flag = findForm.settlement_flag;

    if (!d.goods_match || d.goods_match.length === 0) {
      d.goods_match = [];
      for (const goods_match_idx of d.goods_match_idxs) {
        const findGoodsMatchObj = _.find(goods_match, { idx: Number(goods_match_idx) });
        if (!findGoodsMatchObj) continue;
        const findObj = _.find(goods_data, { idx: Number(findGoodsMatchObj.goods_idx) });
        if (!findObj) continue;
        const goods = {
          ...findObj,
          category_fee_rate: findGoodsMatchObj.category_fee_rate,
          match_count: findGoodsMatchObj.match_count,
          goods_match_idx: Number(goods_match_idx),
        };
        d.goods_match.push(goods);
      }
    }

    setSelectFormsMatchData({ ...selectFormsMatchRef.current });
  };
  const onDeleteFormsMatchTable = (d) => {
    request.post(`user/forms/match/delete`, { forms_match_idx: d.idx }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        Recoils.setState('DATA:FORMSMATCH', data.forms_match);
        Recoils.setState('DATA:GOODSMATCH', data.goods_match);

        setItems(
          _.filter(items, (item) => {
            return item.idx !== d.idx;
          })
        );
        selectFormsMatchRef.current = null;
        setSelectFormsMatchData(selectFormsMatchRef.current);
      }
    });
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
      selectFormsMatchRef.current.delete = true;
      selectFormsMatchRef.current.save = true;
      saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
    }

    setSelectFormsMatchData({ ...selectFormsMatchRef.current });
  };

  const onChangeGoodsMatchTable = (goods_match) => {
    if (!selectFormsMatchRef.current) return; // TODO error

    const rawGoodsMatch = Recoils.getState('DATA:GOODSMATCH');

    if (forms_match) {
      for (const match_data of forms_match) {
        match_data.goods_match = [];
        match_data.forms_option_name = `${match_data.forms_option_name1}`;
        match_data.forms_option_name += match_data.forms_option_name2 ? `\n${match_data.forms_option_name2}` : '';
        match_data.forms_option_name += match_data.forms_option_name3 ? `\n${match_data.forms_option_name3}` : '';

        for (const goods_match_idx of match_data.goods_match_idxs) {
          const findGoodsMatchObj = _.find(rawGoodsMatch, {
            idx: Number(goods_match_idx),
          });
          if (!findGoodsMatchObj) continue;
          const findObj = _.find(goods_data, { idx: Number(findGoodsMatchObj.goods_idx) });
          if (!findObj) continue;
          const goods = {
            ...findObj,
            category_fee_rate: findGoodsMatchObj.category_fee_rate,
            match_count: findGoodsMatchObj.match_count,
            goods_match_idx: Number(goods_match_idx),
          };
          match_data.goods_match.push(goods);
        }
      }
    }

    selectFormsMatchRef.current.goods_match = [...goods_match];

    if (forms_match) {
      if (
        _.find(selectFormsMatchRef.current.goods_match, (goods_match) => {
          return !goods_match.goods_match_idx;
        })
      ) {
        selectFormsMatchRef.current.save = true;
        saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
        return;
      }

      for (const current_goods_match_data of selectFormsMatchRef.current.goods_match) {
        if (!current_goods_match_data.goods_match_idx) {
          selectFormsMatchRef.current.save = true;
          saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
          break;
        }

        const raw_current_forms_match_data = _.find(forms_match, (d) => {
          return _.includes(d.goods_match_idxs, current_goods_match_data.goods_match_idx);
        });

        const raw_current_goods_match_data = _.find(raw_current_forms_match_data.goods_match, (d) => {
          return d.goods_match_idx === current_goods_match_data.goods_match_idx;
        });

        if (raw_current_goods_match_data) {
          if (
            raw_current_goods_match_data.match_count !== current_goods_match_data.match_count ||
            (current_goods_match_data.category_fee_rate &&
              raw_current_goods_match_data.category_fee_rate !== current_goods_match_data.category_fee_rate)
          ) {
            selectFormsMatchRef.current.save = true;
            saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
            break;
          } else {
            selectFormsMatchRef.current.save = false;
            saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = null;
          }
        }
      }
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

    const new_goods_match = { ...d };
    new_goods_match.match_count = 1;

    selectFormsMatchRef.current.goods_match = [...selectFormsMatchRef.current.goods_match, new_goods_match];

    if (forms_match) {
      const rawFormsMatchData = _.find(forms_match, (d) => {
        return d.idx === selectFormsMatchRef.current.idx;
      });
      if (!rawFormsMatchData) return;

      const rawGoodsMatchIdxs = rawFormsMatchData.goods_match_idxs;
      const GoodsMatchIdxs = _.map(selectFormsMatchRef.current.goods_match, 'goods_match_idx');

      if (!_.isEqual(rawGoodsMatchIdxs, GoodsMatchIdxs)) {
        selectFormsMatchRef.current.save = true;
        saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
      }
    }

    setSelectFormsMatchData({ ...selectFormsMatchRef.current });
  };

  const onUnSelectStandardProduct_Search = (d) => {
    if (!selectFormsMatchRef.current) return; // TODO error

    _.remove(selectFormsMatchRef.current.goods_match, (goods_match) => {
      return goods_match.idx === d.idx;
    });

    if (forms_match) {
      const rawFormsMatchData = _.find(forms_match, (d) => {
        return d.idx === selectFormsMatchRef.current.idx;
      });
      if (!rawFormsMatchData) return;

      const rawGoodsMatchIdxs = rawFormsMatchData.goods_match_idxs;
      const GoodsMatchIdxs = _.map(selectFormsMatchRef.current.goods_match, 'goods_match_idx');

      if (!_.isEqual(rawGoodsMatchIdxs, GoodsMatchIdxs)) {
        selectFormsMatchRef.current.save = true;
        saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
      }
    }

    onDeleteGoodsMatchTable(selectFormsMatchRef.current.goods_match);
  };

  const onSelectCategoryFee_Search = (d) => {
    if (!selectFormsMatchRef.current.goods_match) return;
    for (const good_match of selectFormsMatchRef.current.goods_match) {
      good_match.category_fee_rate = d.category_fee_rate;
    }

    setSelectFormsMatchData({ ...selectFormsMatchRef.current });
  };

  const onSave = (e) => {
    if (!saveFormsMatchRef.current) return;

    const delete_datas = _.filter(saveFormsMatchRef.current, (item) => {
      return item && item.delete;
    });

    const save_datas = _.filter(saveFormsMatchRef.current, (item) => {
      return item && !item.delete && item.save;
    });

    if ((!delete_datas || !delete_datas.length) && (!save_datas || !save_datas.length)) {
      modal.alert('저장할 데이터가 없습니다.');
      return; // TODO error
    }

    for (const delete_data of delete_datas) {
      request.post(`user/forms/match/delete`, { forms_match_idx: delete_data.idx }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);
        }
      });
    }

    request.post(`user/forms/match/save`, { save_datas }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);

        Recoils.setState('DATA:FORMSMATCH', data.forms_match);
        Recoils.setState('DATA:GOODSMATCH', data.goods_match);

        setItems(_.cloneDeep(Recoils.getState('DATA:FORMSMATCH')));
      }
    });
  };

  return (
    <>
      <Head />
      <Body title={`판매상품 연결조회`} myClass={'sale_product'}>
        <FormManagementNavTab active="/settlement/sale_product" />
        <div className="page">
          <div className="section1">
            <h3>판매 상품 연결 조회</h3>
            <button onClick={onSave} className="btn_blue btn-primary">
              전체 저장
            </button>
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
              parentFormsMatchSelectData={selectFormsMatchData}
              selectCallback={onSelectCategoryFee_Search}
            ></CategoryFee_Search>
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(SaleProduct);

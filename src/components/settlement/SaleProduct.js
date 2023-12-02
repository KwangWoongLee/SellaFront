import React, { useState, useEffect, useRef } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { modal, page_reload } from 'util/com';
import request from 'util/request';
import FormManagementNavTab from 'components/settlement/common/FormManagementNavTab';
import FormsMatchTable from 'components/settlement/common/FormsMatchTable';
import GoodsMatchTable from 'components/settlement/common/GoodsMatchTable';
import CategoryFee_Search from 'components/settlement/common/CategoryFee_Search';
import StandardProduct_Search from 'components/settlement/common/StandardProduct_Search';

import { logger } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import { useMediaQuery } from 'react-responsive';

import 'styles/SaleProduct.scss';
import MobileRefuser from 'components/template/MobileRefuser';

const SaleProduct = () => {
  const isMobile = useMediaQuery({
    query: '(max-width:768px)',
  });

  const [items, setItems] = useState([]);
  const [formsMatchSelect, setFormsMatchSelect] = useState(null);
  const forms = _.cloneDeep(Recoils.getState('DATA:PLATFORMS'));
  const goods_data = [...Recoils.getState('DATA:GOODS')];
  let rawGoodsMatch = Recoils.getState('DATA:GOODSMATCH');

  const selectFormsMatchRef = useRef(null);
  const [selectFormsMatchData, setSelectFormsMatchData] = useState();

  const saveFormsMatchRef = useRef(null);

  useEffect(() => {
    const forms_match = _.cloneDeep(Recoils.getState('DATA:FORMSMATCH'));
    const goods_match = _.cloneDeep(Recoils.getState('DATA:GOODSMATCH'));

    for (const match_data of forms_match) {
      match_data.goods_match = [];
      match_data.forms_match_idx = match_data.idx;
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
          reg_date: findGoodsMatchObj.reg_date,
          goods_match_idx: Number(goods_match_idx),
        };
        match_data.goods_match.push(goods);
      }
    }

    saveFormsMatchRef.current = new Array(forms_match.length);

    setItems([...forms_match]);
  }, []);

  const onSelectFormsMatchTable = (d) => {
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

        rawGoodsMatch = _.cloneDeep(data.goods_match);

        const filteredArr = _.filter(_.cloneDeep(items), (item) => item.forms_match_idx !== d.forms_match_idx);

        saveFormsMatchRef.current = new Array(filteredArr.length);

        if (!filteredArr.length) {
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
        if (diff_data.goods_match_idx) {
          let findObj = _.find(selectFormsMatchRef.current.goods_match, {
            goods_match_idx: diff_data.goods_match_idx,
          });
          findObj = diff_data;
        } else {
          let findObj = _.find(selectFormsMatchRef.current.goods_match, {
            idx: diff_data.idx,
          });

          let findRawObj = _.find(rawGoodsMatch, {
            goods_idx: diff_data.idx,
          });

          if (findObj) {
            findObj = diff_data;
            findObj.goods_match_idx = findRawObj.idx;
          } else {
            selectFormsMatchRef.current.goods_match.push(diff_data);
          }
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
      new_goods_match.new = false;
      new_goods_match = { ...new_goods_match, findRawObj };
    } else {
      new_goods_match.new = true;
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
          saveFormsMatchRef.current[selectFormsMatchRef.current.idx] = _.cloneDeep(selectFormsMatchRef.current);
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
    if (!selectFormsMatchRef.current) return; // TODO error

    for (const good_match of selectFormsMatchRef.current.goods_match) {
      good_match.category_fee_rate = Number(d.category_fee_rate).toFixed(2);
    }

    setSelectFormsMatchData({ ...selectFormsMatchRef.current });
  };

  const onSave = (e) => {
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

    if (delete_datas && delete_datas.length) {
      request
        .post(`user/forms/match/delete/multi`, { forms_match_idxs: _.map(delete_datas, 'forms_match_idx') })
        .then((ret) => {
          if (!ret.err) {
            const { data } = ret.data;
            logger.info(data);

            if (save_datas && save_datas.length) {
              request.post(`user/forms/match/save`, { save_datas }).then((ret) => {
                if (!ret.err) {
                  const { data } = ret.data;
                  logger.info(data);

                  Recoils.setState('DATA:FORMSMATCH', data.forms_match);
                  Recoils.setState('DATA:GOODSMATCH', data.goods_match);

                  page_reload();
                }
              });
            }
          }
        });
    } else {
      if (save_datas && save_datas.length) {
        request.post(`user/forms/match/save`, { save_datas }).then((ret) => {
          if (!ret.err) {
            const { data } = ret.data;
            logger.info(data);

            Recoils.setState('DATA:FORMSMATCH', data.forms_match);
            Recoils.setState('DATA:GOODSMATCH', data.goods_match);

            page_reload();
          }
        });
      }
    }
  };

  return (
    <>
      <Head />
      <Body title={`판매상품 연결조회`} myClass={'sale_product'}>
        <FormManagementNavTab active="/settlement/sale_product" />
        <div className="page">
          {isMobile ? (
            <>
              <MobileRefuser></MobileRefuser>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(SaleProduct);

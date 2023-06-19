import React, { useState, useEffect } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import request from 'util/request';
import { modal } from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';
import icon_add from 'images/icon_add.svg';
import icon_del from 'images/icon_del.svg';

import 'styles/Step1.scss';

import { logger } from 'util/com';

// 임시 매직코드
const maxDeliItemCount = 8;
const maxPackItemCount = 8;

const DeliItem_Default = [
  { delivery_category: '기본값', delivery_fee: 0 },
  { delivery_category: '택배 극소', delivery_fee: 0 },
  { delivery_category: '택배 소', delivery_fee: 0 },
  { delivery_category: '택배 중', delivery_fee: 0 },
  { delivery_category: '택배 대', delivery_fee: 0 },
];

const PackItem_Default = [
  { packing_category: '기본값', packing_fee1: 0, packing_fee2: 0 },
  { packing_category: '포장비 1', packing_fee1: 0, packing_fee2: 0 },
  { packing_category: '포장비 2', packing_fee1: 0, packing_fee2: 0 },
  { packing_category: '포장비 3', packing_fee1: 0, packing_fee2: 0 },
  { packing_category: '포장비 4', packing_fee1: 0, packing_fee2: 0 },
];
//

const Step1 = () => {
  const [deliItems, setDeliItems] = useState([]);
  const [packItems, setPackItems] = useState([]);

  logger.render('Step1');
  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  useEffect(() => {
    request.post(`user/delivery`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        ret.data.length ? setDeliItems(() => ret.data) : setDeliItems(DeliItem_Default);
      }
    });

    request.post(`user/packing`, { aidx }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        ret.data.length ? setPackItems(() => ret.data) : setPackItems(PackItem_Default);
      }
    });

    setPackItems(PackItem_Default);
  }, []);

  const onChange = (type, e) => {
    const { value, name } = e.target; // 우선 e.target 에서 name 과 value 를 추출
    const index = e.currentTarget.parentNode.parentNode.rowIndex;

    if (type === 'Delivery') {
      const newDeliItems = deliItems.slice();

      newDeliItems[index][name] = value;
      setDeliItems(newDeliItems);
    } else if (type === 'Packing') {
      const newPackItems = packItems.slice();

      newPackItems[index][name] = value;
      setPackItems(newPackItems);
    }
  };

  const onClickAdd = (type, e) => {
    if (type === 'Delivery') {
      if (deliItems.length >= maxDeliItemCount) return;

      setDeliItems([...deliItems, { delivery_category: '', delivery_fee: 0 }]);
    } else if (type === 'Packing') {
      if (packItems.length >= maxPackItemCount) return;

      setPackItems([...packItems, { packing_category: '', packing_fee1: 0, packing_fee2: 0 }]);
    }
  };

  const onDelete = (type, e) => {
    const index = e.currentTarget.parentNode.parentNode.parentNode.rowIndex;

    if (type === 'Delivery') {
      setDeliItems(() => deliItems.filter((v, i) => i !== index));
    } else if (type === 'Packing') {
      setPackItems(() => packItems.filter((v, i) => i !== index));
    }
  };

  const onSave = (type, e) => {
    if (type === 'Delivery') {
      const delivery_list = [];
      const nodes = e.currentTarget.parentNode.parentNode.childNodes[2].childNodes;
      for (const idx in nodes) {
        const node = nodes[idx];
        if (!node) continue;

        const tds = node.childNodes;
        if (!tds) continue;

        if (tds.length >= 3) {
          const category = tds[0].childNodes[1].defaultValue;
          const fee = tds[1].childNodes[0].defaultValue;

          if (!category || category === '' || !fee) {
            modal.alert('error', '', '빈 항목이 있습니다.');
            return;
          }

          delivery_list.push({ category, fee });
        }
      }
      request.post(`user/delivery/save`, { aidx, delivery_list }).then((ret) => {
        if (!ret.err) {
          logger.info(ret.data);

          setDeliItems(() => ret.data);
          modal.alert('success', '저장 완료', '운임비 데이터가 저장 되었습니다.');
        }
      });
    } else if (type === 'Packing') {
      const packing_list = [];
      const nodes = e.currentTarget.parentNode.parentNode.childNodes[2].childNodes;
      for (const idx in nodes) {
        const node = nodes[idx];
        if (!node) continue;

        const tds = node.childNodes;
        if (!tds) continue;

        if (tds.length >= 4) {
          const category = tds[0].childNodes[1].defaultValue;
          const fee1 = tds[1].childNodes[0].defaultValue;
          const fee2 = tds[2].childNodes[0].defaultValue;

          if (!category || category === '' || !fee1 || !fee2) {
            modal.alert('error', '', '빈 항목이 있습니다.');
            return;
          }

          packing_list.push({ category, fee1, fee2 });
        }
      }
      request.post(`user/packing/save`, { aidx, packing_list }).then((ret) => {
        if (!ret.err) {
          logger.info(ret.data);

          setPackItems(() => ret.data);
          modal.alert('success', '저장 완료', '포장비 데이터가 저장 되었습니다.');
        }
      });
    }
  };

  return (
    <>
      <Head />
      <Body title={`Step1`}>
        <div className="page">
          <table className="section">
            <caption>
              택배비 관리{' '}
              <button className="btn_blue" onClick={(e) => onSave('Delivery', e)}>
                저장
              </button>
            </caption>
            <thead>
              <th>구분</th>
              <th>택배비</th>
              <th></th>
            </thead>
            <tbody>
              <>
                {deliItems &&
                  deliItems.map((d, key) => (
                    <DeliveryFeeItem
                      key={key}
                      index={key}
                      d={d}
                      onDelete={onDelete}
                      onChange={(e) => onChange('Delivery', e)}
                    />
                  ))}
              </>
              <tr>
                <td colSpan="3" className="td_btn_add">
                  <span className="txt_small">최대 8개!</span>
                  <button className="btn_add btn_off" onClick={(e) => onClickAdd('Delivery', e)}>
                    <img src={icon_add} alt="추가" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <table className="section">
            <caption>
              포장비 관리{' '}
              <button className="btn_blue" onClick={(e) => onSave('Packing', e)}>
                저장
              </button>
            </caption>
            <thead>
              <th>구분</th>
              <th>박스/비닐</th>
              <th>기타 포장비</th>
              <th>포장비 합계</th>
              <th></th>
            </thead>
            <tbody>
              <>
                {packItems &&
                  packItems.map((d, key) => (
                    <PackingFeeItem
                      key={key}
                      index={key}
                      d={d}
                      onDelete={onDelete}
                      onChange={(e) => onChange('Packing', e)}
                    />
                  ))}
              </>
              <tr>
                <td colSpan="3" className="td_btn_add">
                  <span className="txt_small">최대 8개!</span>
                  <button className="btn_add btn_off" onClick={(e) => onClickAdd('Packing', e)}>
                    <img src={icon_add} alt="추가" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Body>
      <Footer />
    </>
  );
};

const DeliveryFeeItem = React.memo(({ index, d, onChange, onDelete }) => {
  logger.render('DeliveryFee TableItem : ', index);
  return (
    <tr>
      {index == 0 ? (
        <td>
          <span className="txt_required">*</span>
          <input name="delivery_category" type="text" value={d.delivery_category} onChange={onChange} disabled />
        </td>
      ) : (
        <td>
          <span className="txt_notrequired">*</span>
          <input name="delivery_category" type="text" value={d.delivery_category} onChange={onChange} />
        </td>
      )}

      <td>
        <input name="delivery_fee" type="text" value={d.delivery_fee} onChange={onChange} />
        <span className="input_right">원</span>
      </td>
      {index == 0 ? (
        <td></td>
      ) : (
        <td>
          <button className="btn_del">
            <img src={icon_del} alt="삭제" onClick={(e) => onDelete('Delivery', e)} />
          </button>
        </td>
      )}
    </tr>
  );
});

const PackingFeeItem = React.memo(({ index, d, onChange, onDelete }) => {
  logger.render('PackingFee TableItem : ', index);
  return (
    <tr>
      {index == 0 ? (
        <td>
          <span className="txt_required">*</span>
          <input name="packing_category" type="text" value={d.packing_category} onChange={onChange} disabled />
        </td>
      ) : (
        <td>
          <span className="txt_notrequired">*</span>
          <input name="packing_category" type="text" value={d.packing_category} onChange={onChange} />
        </td>
      )}

      <td>
        <input name="packing_fee1" type="number" value={Number(d.packing_fee1)} onChange={onChange} />
        <span className="input_right">원</span>
      </td>
      <td>
        <input name="packing_fee2" type="number" value={Number(d.packing_fee2)} onChange={onChange} />
        <span className="input_right">원</span>
      </td>
      <td>
        <span className="input_left">총</span>
        <span className="txt_sum">{Number(d.packing_fee1) + Number(d.packing_fee2)}</span>
        <span className="input_right">원</span>
      </td>

      {index == 0 ? (
        <td></td>
      ) : (
        <td>
          <button className="btn_del">
            <img src={icon_del} alt="삭제" onClick={(e) => onDelete('Packing', e)} />
          </button>
        </td>
      )}
    </tr>
  );
});

export default React.memo(Step1);

import React, { useState, useEffect } from 'react';

import {} from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import request from 'util/request';
import { img_src, modal } from 'util/com';
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
  { delivery_category: '택배 극소', delivery_fee: 0, _order: 1 },
  { delivery_category: '택배 소', delivery_fee: 0, _order: 2 },
  { delivery_category: '택배 중', delivery_fee: 0, _order: 3 },
  { delivery_category: '택배 대', delivery_fee: 0, _order: 4 },
];

const PackItem_Default = [
  { packing_category: '포장비 1', packing_fee1: 0, packing_fee2: 0, _order: 1 },
  { packing_category: '포장비 2', packing_fee1: 0, packing_fee2: 0, _order: 2 },
  { packing_category: '포장비 3', packing_fee1: 0, packing_fee2: 0, _order: 3 },
  { packing_category: '포장비 4', packing_fee1: 0, packing_fee2: 0, _order: 4 },
];
//

const Step1 = () => {
  const [deliItems, setDeliItems] = useState([]);
  const [packItems, setPackItems] = useState([]);

  logger.render('Step1');

  useEffect(() => {
    const delivery_data = _.cloneDeep(Recoils.getState('DATA:DELIVERY'));
    delivery_data && delivery_data.length > 1
      ? setDeliItems(delivery_data)
      : setDeliItems([delivery_data[0], ...DeliItem_Default]);

    const packing_data = _.cloneDeep(Recoils.getState('DATA:PACKING'));
    packing_data && packing_data.length > 1
      ? setPackItems(packing_data)
      : setPackItems([packing_data[0], ...PackItem_Default]);
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

  //8개 이상일때 추가 버튼의 .btn_on 클래스를 .btn_off로 변경 부탁드려요!
  //반대로 8개 이하일때 .btn_off 클래스를 .btn_on으로 변경 부탁드립니다 ㅎㅎ

  const onClickAdd = (type, e) => {
    if (type === 'Delivery') {
      if (deliItems.length >= maxDeliItemCount) return;
      const orders = _.map(deliItems, '_order');
      const orderMax = _.max(orders);
      setDeliItems([...deliItems, { delivery_category: '', delivery_fee: 0, _order: orderMax + 1 }]);
    } else if (type === 'Packing') {
      if (packItems.length >= maxPackItemCount) return;

      const orders = _.map(packItems, '_order');
      const orderMax = _.max(orders);
      setPackItems([...packItems, { packing_category: '', packing_fee1: 0, packing_fee2: 0, _order: orderMax + 1 }]);
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
      const fault_item = _.find(deliItems, (item) => {
        return _.trim(item.delivery_category) == '';
      });
      if (fault_item) {
        modal.alert(`'구분' 값을 확인해주세요.`);
        return;
      }

      const restricted_name_item = _.find(deliItems, (item) => {
        return _.trim(item.delivery_category) == '기타';
      });
      if (restricted_name_item) {
        modal.alert(`'구분' 값에 '기타'는 셀라 기본 구분값으로, 사용 할 수 없습니다.`);
        return;
      }

      request.post(`user/delivery/save`, { delivery_list: deliItems }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);

          Recoils.setState('DATA:DELIVERY', data);

          setDeliItems(() => data);
          modal.alert('택배비 데이터가 저장되었습니다.');
        }
      });
    } else if (type === 'Packing') {
      const fault_item = _.find(packItems, (item) => {
        return _.trim(item.packing_category) == '';
      });
      if (fault_item) {
        modal.alert(`'구분' 값을 확인해주세요.`);
        return;
      }

      const restricted_name_item = _.find(packItems, (item) => {
        return _.trim(item.packing_category) == '기타';
      });
      if (restricted_name_item) {
        modal.alert(`'구분' 값에 '기타'는 셀라 기본 구분값으로, 사용 할 수 없습니다.`);
        return;
      }

      request.post(`user/packing/save`, { packing_list: packItems }).then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);
          Recoils.setState('DATA:PACKING', data);

          setPackItems(() => data);
          modal.alert('포장비 데이터가 저장 되었습니다.');
        }
      });
    }
  };

  return (
    <>
      <Head />
      <Body title={`Step1`} myClass={'step1'}>
        <div className="page">
          <div className="section tablebox1">
            <h3>
              택배비 관리{' '}
              <button className="btn-primary btn btn_blue" onClick={(e) => onSave('Delivery', e)}>
                저장
              </button>
            </h3>

            <table>
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
                    <button
                      className={`btn_add ${deliItems.length >= 8 ? 'btn_off' : 'btn_of'}`}
                      onClick={(e) => onClickAdd('Delivery', e)}
                    >
                      <img src={`${img_src}${icon_add}`} alt="추가" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="section tablebox2">
            <h3>
              포장비 관리{' '}
              <button className="btn-primary btn btn_blue" onClick={(e) => onSave('Packing', e)}>
                저장
              </button>
            </h3>

            <table className="section">
              <thead>
                <th>구분</th>
                <th>박스/비닐</th>
                <th>기타포장비</th>
                <th>포장비합계</th>
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
                  <td colSpan="5" className="td_btn_add">
                    <span className="txt_small">최대 8개!</span>
                    <button
                      className={`btn_add ${packItems.length >= 8 ? 'btn_off' : 'btn_of'}`}
                      onClick={(e) => onClickAdd('Packing', e)}
                    >
                      <img src={`${img_src}${icon_add}`} alt="추가" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
        <input name="delivery_fee" type="number" value={d.delivery_fee} onChange={onChange} />
        <span className="input_right">원</span>
      </td>
      {index == 0 ? (
        <td></td>
      ) : (
        <td>
          <button className="btn_del">
            <img src={`${img_src}${icon_del}`} alt="삭제" onClick={(e) => onDelete('Delivery', e)} />
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
            <img src={`${img_src}${icon_del}`} alt="삭제" onClick={(e) => onDelete('Packing', e)} />
          </button>
        </td>
      )}
    </tr>
  );
});

export default React.memo(Step1);

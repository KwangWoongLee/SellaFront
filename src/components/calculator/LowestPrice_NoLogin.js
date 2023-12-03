import React, { useState, useEffect, useRef, useMemo } from 'react';

import { Button, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Head_NoLogin from 'components/template/Head_NoLogin';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';

import { img_src, modal, logger, page_reload, navigate, is_authed, revert_1000, replace_1000 } from 'util/com';
import request from 'util/request';
import _ from 'lodash';

import 'styles/Margin.scss';

import img_lowestprice_01 from 'images/img_lowestprice_01.png';

const LowestPrice_NoLogin = () => {
  const [platformData, setPlatformData] = useState([]);
  const [platformType, setplatformType] = useState(-1);

  //inputs
  const sellDeliveryFeeRef = useRef(null);
  const stockPriceRef = useRef(null);
  const savedDPFeeRef = useRef(null);
  const platformFeeRateRef = useRef(null);
  const lowestMarginRateRef = useRef(null);
  //
  const [lowestPrice, setLowestPrice] = useState('');

  useEffect(() => {
    request.post(`base/info/sella_platform`, {}).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);
        setPlatformData(() => data.platform);
        setplatformType(0);
      }
    });
  }, []);

  useEffect(() => {
    if (platformType === -1) return;

    let platformFeeRate = Number(platformData[platformType].fee_rate);
    platformFeeRate = platformFeeRate.toFixed(2);
    platformFeeRateRef.current.value = platformFeeRate;
  }, [platformType]);

  const onChange = (key, e) => {
    setplatformType(key);
  };

  const onChangeInput = (e, ref) => {
    ref.current.value = replace_1000(revert_1000(e.target.value));
  };

  const onClickCalc = (e) => {
    let stockPrice = stockPriceRef.current.value;
    let lowestMarginRate = lowestMarginRateRef.current.value;

    let platformFeeRate = platformFeeRateRef.current.value;
    if (stockPrice === '') {
      modal.alert('매입가를 입력해주세요.');
      return;
    }

    if (isNaN(lowestMarginRate) || lowestMarginRate === '') {
      lowestMarginRate = 0;
      lowestMarginRateRef.current.value = 0;
    }

    stockPrice = revert_1000(stockPrice);
    const sumMinus = stockPrice;

    lowestMarginRate = Number(lowestMarginRate);
    if (lowestMarginRate < 0 || lowestMarginRate >= 100) {
      modal.alert('최저마진율을 0~100% 사이로 입력해주세요.');
      return;
    }
    lowestMarginRate = Number((lowestMarginRate / 100).toFixed(5));

    platformFeeRate = Number(platformFeeRate);
    if (platformFeeRate < 0 || platformFeeRate >= 100) {
      modal.alert('매체 수수료율을 0~100% 사이로 입력해주세요.');
      return;
    }
    platformFeeRate = platformFeeRate / 100;
    platformFeeRate = Number(platformFeeRate.toFixed(5));

    if (1 - platformFeeRate - lowestMarginRate == 0) {
      modal.alert('최저마진율과 수수료의 합이 100이 될 수 없습니다.');
      return;
    }

    // const wannaLowestPrice = wannaMargin / (1 - platformFeeRate);
    const wannaLowestPrice = stockPrice / (1 - platformFeeRate - lowestMarginRate);

    const low = replace_1000(revert_1000(wannaLowestPrice.toFixed(0)));

    setLowestPrice(low);
  };

  const onReset = () => {
    stockPriceRef.current.value = '';
    savedDPFeeRef.current.value = '';
    lowestMarginRateRef.current.value = '';
    setplatformType(0);
    setLowestPrice('');
  };

  return (
    <>
      {is_authed() ? <Head /> : <Head_NoLogin />}
      <Body title={`최저가 계산기`} myClass={'margin lowestprice nologin'}>
        {/* <CalculatorNavTab active="/calculator/margin" /> */}
        <div className="section section1">
          <div className="tablebox1">
            <table>
              <colgroup>
                <col width="50px" />
                <col />
              </colgroup>
              <tbody>
                <tr>
                  <th>최저판매가</th>
                  <td>
                    {lowestPrice}
                    <span> 원</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="tablebox2">
            <table>
              <tbody>
                <tr>
                  <th>최저 마진율</th>
                </tr>
                <tr>
                  <td className="w100">
                    <input type="number" ref={lowestMarginRateRef}></input>
                    <span>%</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="txt_red">매입가</span>
                    <input
                      type="text"
                      ref={stockPriceRef}
                      onChange={(e) => {
                        onChangeInput(e, stockPriceRef);
                      }}
                    ></input>
                    <span>원</span>
                  </td>
                </tr>

                <tr>
                  <td>
                    <span className="txt_red">수수료</span>
                    <DropdownButton
                      variant=""
                      title={platformType !== -1 && platformData.length ? platformData[platformType].name : ''}
                      className="nounit"
                    >
                      {platformData &&
                        platformData.map((item, key) => (
                          <Dropdown.Item
                            key={key}
                            eventKey={key}
                            onClick={(e) => onChange(key, e)}
                            active={platformType === key}
                          >
                            {item.name}
                          </Dropdown.Item>
                        ))}
                    </DropdownButton>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="txt_small">매체 수수료</span>
                    <input type="number" ref={platformFeeRateRef}></input>
                    <span>%</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <Button variant="primary" className="btn_blue btn_calc" onClick={onClickCalc}>
            계산하기
          </Button>
          <div className="btnbox">
            <Button variant="primary" onClick={onReset}>
              초기화
            </Button>
          </div>
        </div>
        <div className="section section2">
          <h3>최저가 계산기</h3>
          <h5>왜 필요한가요?</h5>
          <div class="innerbox">
            <p>“ 최소 10% 마진은 남기고 싶어 ”</p>
            <p>“ 얼마 이상 팔아야 하는거야? ”</p>
            <img src={`${img_src}${img_lowestprice_01}`} />
            <ul>
              <li>
                <b>최적의 마진을 위한 가격책정. 어떻게 하고 계세요?</b>
              </li>
              <li>
                판매할 최저 금액을 잘 모르겠을 때 사용해보세요.
                <br />
                더 이상 손해 안보는 판매가 책정
                <br />
                최저가 계산기로 최저 금액을 미리 계산하세요.
              </li>
            </ul>
            {/* <h4>더 많은 기능을 사용해보세요!</h4>
            <button
              type="button"
              onClick={() => {
                navigate('/login');
              }}
              class="btn-primary btn btn-primary"
            >
              셀라 무료체험 신청
            </button> */}
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(LowestPrice_NoLogin);

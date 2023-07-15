import React, { useEffect } from 'react';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import MyPageNavTab from 'components/base/MyPageNavTab';
import { logger } from 'util/com';

import 'styles/Mypage.scss';

const MyPage = () => {
  logger.render('MyPage');

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`ver ${process.env.REACT_APP_VERSION}`} myClass={'mypage'}>
        <MyPageNavTab active="/base/mypage" />

        <div className="page">
          <div className="innerbox">
            <h4>고객님은 현재 [Basic] 플랜을 사용하고 계십니다.</h4>
            <h3>
              멤버십 혜택 안내<span>고객님께 꼭 필요한 기능을 준비했습니다.</span>
            </h3>

            <div className="planbox">
              <div className="plan1">
                <dl>
                  <dt>Basic</dt>
                  <dd>무료</dd>
                  <dd>정산에 최적화된 플랜</dd>
                </dl>

                <ul>
                  <li>주문 별 손익계산</li>
                  <li>오늘 주문 손익 합계</li>
                  <li>마진율 계산기</li>
                  <li>사입 계산기</li>
                  <li>엑셀 양식 설정</li>
                </ul>

                <button className="btn-primary">사용중</button>
              </div>

              <div className="plan2">
                <dl>
                  <dt>Standard</dt>
                  <dd>29,900원 / 월</dd>
                  <dd>주문처리를 간편하게! (샵마인)</dd>
                </dl>

                <ul>
                  <li>Basic의 모든 기능</li>
                  <li>쇼핑몰 연동, 일괄 주문수집</li>
                  <li>수집된 주문건 자동 손익 계산</li>
                  <li>신규주문부터 발송처리, 구매확정 관리</li>
                  <li>반품/교환/취소 관리</li>
                  <li>주문서 인쇄, 택배사 연동, 송창 출력</li>
                  <li>손익 데이터 1년치 저장</li>
                  <li>정산예정금액, 통계 보기</li>
                </ul>

                <button className="btn-primary btn_flblue">구독하기</button>
              </div>

              <div className="plan3">
                <dl>
                  <dt>Premium</dt>
                  <dd>49,900원 / 월</dd>
                  <dd>상품관리까지 완벽하게! (토글)</dd>
                </dl>

                <ul>
                  <li>Basic, Standard의 모든 기능</li>
                  <li>연동 쇼핑몰의 판매 상품관리, 상품등록</li>
                  <li>CS 문의 관리, 평점 낮은 리뷰 관리</li>
                  <li>상품/옵션 별 재고관리</li>
                  <li>연동 쇼핑몰의 판매상품 자동 품절처리</li>
                  <li>구독 만료시까지 데이터 저장</li>
                </ul>

                <button className="btn-primary btn_flblue">구독하기</button>
              </div>
            </div>
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

for (const name in process.env) {
  logger.info(`${name} = ${process.env[name]}`);
}

export default React.memo(MyPage);

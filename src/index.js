import React from 'react';
import ReactDOM from 'react-dom';
import App from 'App';
import { Helmet } from 'react-helmet';

ReactDOM.render(
  <React.StrictMode id="top">
    <Helmet>
      <meta property="og:type" content="website" />
      <meta property="og:title" content="셀러라면" />
      <meta
        property="og:description"
        content="업로드한 주문서의 저장으로 매일 판매한 실제 매출, 손익 계산 결과, 택배 발송 건수 등 비즈니스에 꼭 필요한 정산 데이터를 한눈에 볼 수 있습니다."
      />
      <meta property="og:image" content="https://sella.co.kr/images/logo_symbol.svg"></meta>
      <meta property="og:url" content="https://sella.co.kr" />
      <meta name="naver-site-verification" content="7a1691caacf9a2af8147d63dfb9ea97a4ac6b060" />
    </Helmet>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

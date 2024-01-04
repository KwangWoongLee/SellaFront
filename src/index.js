import React from 'react';
import ReactDOM from 'react-dom';
import App from 'App';
import { Helmet } from 'react-helmet';

ReactDOM.render(
  <React.StrictMode id="top">
    <Helmet>
      <meta name="naver-site-verification" content="7a1691caacf9a2af8147d63dfb9ea97a4ac6b060" />
    </Helmet>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

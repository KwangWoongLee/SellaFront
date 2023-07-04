import React, { useEffect } from 'react';

import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import Recoils from 'recoils';

import { logger } from 'util/com';

const Manual = () => {
  logger.render('Manual');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`사용방법`} myClass={'cscenter manual'}>
        <CSCenterNavTab active="/cscenter/manual" />
        <div className="page">
          <h3>사용방법</h3>
          <div className="pagination"></div>
          <div className="inputbox"></div>
          <div className="tablebox">
            <table className="thead">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>카테고리</th>
                  <th>제목</th>
                </tr>
              </thead>
              <table className="tbody">
                <tbody></tbody>
              </table>
            </table>
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(Manual);

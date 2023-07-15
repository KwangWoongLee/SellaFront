import React, { useState, useEffect, useRef } from 'react';

import { Nav } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import request from 'util/request';
import { modal } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import logo_symbol from 'images/logo_symbol.svg';

import 'styles/CSCenter.scss';

import { logger } from 'util/com';

const CSCenter = () => {
  logger.render('CSCenter');

  useEffect(() => {}, []);

  return (
    <>
      <Head />
      <Body title={`CSCenter`} myClass={'cscenter main'}>
        <CSCenterNavTab active="/CSCenter" className="navtab cscenter" />

        <div className="page">
          <h3>
            고객센터
            <dl className="informbox">
              <dd>운영시간 : 10:00 ~ 17:00</dd>
              <dt>070-1111-1111</dt>
            </dl>
          </h3>

          <div className="section1">
            <div className="tablebox1">
              <h4>
                <img src={logo_symbol} />
                공지사항
                <button className="btn-primary btn_more"></button>
              </h4>
              <table>
                <tbody>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                  <tr>
                    <td>
                      공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항공지사항
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="tablebox2">
              <h4>
                <img src={logo_symbol} />
                자주 묻는 질문 (FAQ)
                <button className="btn-primary btn_more"></button>
              </h4>
              <table>
                <tbody>
                  <tr>
                    <td>
                      <i>결제</i> 자주묻는 질문
                    </td>
                    <td>2023-05-22</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="section2">
            <div className="tablebox1">
              <h4>
                <img src={logo_symbol} />
                사용방법
                <button className="btn-primary btn_more"></button>
              </h4>
              <table>
                <tbody>
                  <tr>
                    <td>사용방법사용방법사용방법사용방법</td>
                    <td>2023-05-22</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(CSCenter);

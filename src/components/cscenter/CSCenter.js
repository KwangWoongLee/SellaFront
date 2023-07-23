import React, { useState, useEffect, useRef } from 'react';

import { Nav } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import request from 'util/request';
import { modal, navigate } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import logo_symbol from 'images/logo_symbol.svg';

import 'styles/CSCenter.scss';

import { logger, time_format } from 'util/com';

const CSCenter = () => {
  logger.render('CSCenter');

  const [announcement, setAnnouncements] = useState([]);
  const [faq, setFAQ] = useState([]);

  useEffect(() => {
    request.post(`cscenter/announcement`, { limit: 10 }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);
        const rowCount = ret.data.length;
        rowCount ? setAnnouncements(() => ret.data) : setAnnouncements([]);
      }
    });

    request.post(`cscenter/faq`, { limit: 10 }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);
        const rowCount = ret.data.length;
        rowCount ? setFAQ(() => ret.data) : setFAQ([]);
      }
    });
  }, []);

  const onClickAnnouncement = (e, row) => {
    // 어떻게할까요 ? 페이지 이동 ? modal로 내용 보여주기.. 정책이 필요하네요!
  };

  const onClickFAQ = (e, row) => {
    // 어떻게할까요 ? 페이지 이동 ? modal로 내용 보여주기.. 정책이 필요하네요!
  };

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
                <button
                  onClick={() => {
                    navigate('cscenter/announcement');
                  }}
                  className="btn-primary btn_more"
                ></button>
              </h4>
              <table>
                <tbody>
                  {announcement.map((row, index) => (
                    <tr
                      onClick={(e) => {
                        onClickAnnouncement(e, row);
                      }}
                    >
                      <td>{row.title}</td>
                      <td>{time_format(row.reg_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tablebox2">
              <h4>
                <img src={logo_symbol} />
                자주 묻는 질문 (FAQ)
                <button
                  onClick={() => {
                    navigate('cscenter/faq');
                  }}
                  className="btn-primary btn_more"
                ></button>
              </h4>
              <table>
                <tbody>
                  {faq.map((row, index) => (
                    <tr
                      onClick={(e) => {
                        onClickFAQ(e, row);
                      }}
                    >
                      <td>
                        <i>{row.faq_category}</i> {row.title}
                      </td>
                      <td>{time_format(row.reg_date)}</td>
                    </tr>
                  ))}
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
                  {/* 사용방법은 figma에 아직 화면이 아직없네요 */}
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

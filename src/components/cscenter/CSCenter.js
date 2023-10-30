import React, { useState, useEffect, useRef } from 'react';

import { Nav } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import request from 'util/request';
import { img_src, modal, navigate } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';

import logo_symbol from 'images/logo_symbol.svg';

import 'styles/CSCenter.scss';

import { logger, time_format, time_format_none_time } from 'util/com';

const CSCenter = () => {
  //logger.debug('CSCenter');

  const [announcement, setAnnouncements] = useState([]);
  const [faq, setFAQ] = useState([]);
  const [manual, setManual] = useState([]);

  useEffect(() => {
    request.post(`cscenter/announcement`, { limit: 10 }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);
        const rowCount = data.length;
        rowCount ? setAnnouncements(() => data) : setAnnouncements([]);
      }
    });

    request.post(`cscenter/faq`, { limit: 10 }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);
        const rowCount = data.length;
        rowCount ? setFAQ(() => data) : setFAQ([]);
      }
    });

    request.post(`cscenter/manual`, { limit: 10 }).then((ret) => {
      if (!ret.err) {
        const { data } = ret.data;
        logger.info(data);
        const rowCount = data.length;
        rowCount ? setManual(() => data) : setManual([]);
      }
    });
  }, []);

  const onClickAnnouncement = (e, row) => {
    com.storage.setItem('nav_announcement', row.idx);
    navigate('/cscenter/announcement');
  };

  const onClickFAQ = (e, row) => {
    com.storage.setItem('nav_faq', row.idx);
    navigate('/cscenter/faq');
  };

  const onClickManual = (e, row) => {
    com.storage.setItem('nav_manual', row.idx);
    navigate('/cscenter/manual');
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
                      <td>{time_format_none_time(row.reg_date)}</td>
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
                      <td>{time_format_none_time(row.reg_date)}</td>
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
                  {manual.map((row, index) => (
                    <tr
                      onClick={(e) => {
                        onClickManual(e, row);
                      }}
                    >
                      <td>
                        <i>{row.manual_category}</i> {row.title}
                      </td>
                      <td>{time_format_none_time(row.reg_date)}</td>
                    </tr>
                  ))}
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

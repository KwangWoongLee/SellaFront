import React, { useState, useEffect, useRef } from 'react';

import { Nav } from 'react-bootstrap';
import Head from 'components/template/Head';
import Head_NoLogin from 'components/template/Head_NoLogin';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import request from 'util/request';
import { img_src, modal, navigate, is_authed } from 'util/com';
import com from 'util/com';
import Recoils from 'recoils';
import _ from 'lodash';
import { useMediaQuery } from 'react-responsive';

import logo_symbol from 'images/logo_symbol.svg';

import 'styles/CSCenter.scss';

import { logger, time_format, time_format_none_time } from 'util/com';
import MobileRefuser from 'components/template/MobileRefuser';

const CSCenter = () => {
  const isMobile = useMediaQuery({
    query: '(max-width:1024px)',
  });

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
      {is_authed() ? <Head /> : <Head_NoLogin />}
      <Body title={`CSCenter`} myClass={'cscenter main'}>
        <CSCenterNavTab active="/CSCenter" className="navtab cscenter" />

        <div className="page">
          {isMobile ? (
            <>
              <MobileRefuser></MobileRefuser>
            </>
          ) : (
            <>
              <h3>
                고객센터
                <dl className="informbox">
                  <dd>운영시간 : 10:00 ~ 17:00</dd>
                  <dt>070-8028-4426</dt>
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
            </>
          )}
        </div>
      </Body>
      <Footer />
    </>
  );
};

export default React.memo(CSCenter);

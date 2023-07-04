import React, { useState, useEffect, useRef, useMemo, Fragment } from 'react';

import { Table, Button, Modal, DropdownButton, Dropdown } from 'react-bootstrap';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { useInput, modal, navigate } from 'util/com';
import request from 'util/request';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import Recoils from 'recoils';
import ImageModal from 'components/common/ImageModal';

import { logger } from 'util/com';

import 'styles/CSCenter.scss';

import icon_arrow_left from 'images/icon_arrow_left.svg';
import icon_arrow_right from 'images/icon_arrow_right.svg';
import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

const Announcement = () => {
  logger.render('Announcement');

  const account = Recoils.useValue('CONFIG:ACCOUNT');
  const aidx = account.aidx;

  const [modalState, setModalState] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  //row control
  const [collapseState, setCollapseState] = useState(false);
  const [rowData, setDatas] = useState([]);
  //

  // search input
  const [categoryType, setCategoryType] = useState(0);
  const [title, setTitle] = useState('');
  const category_str = ['일반', '테스트', '전체'];
  //

  // pagination
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const offset = (page - 1) * limit;
  //

  useEffect(() => {
    request.post(`cscenter/announcement`, { category: category_str[categoryType], title }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);
        const rowCount = ret.data.length;
        rowCount ? setDatas(() => ret.data) : setDatas([]);
        rowCount && Math.floor(rowCount / limit) ? setPageCount(Math.floor(rowCount / limit)) : setPageCount(1);
        setPage(1);
      }
    });
  }, []);

  const handleClick = (index) => {
    const updatedState = rowData[index];

    if (updatedState.other) {
      delete updatedState.other;
      setCollapseState(!collapseState);
    } else {
      updatedState.other = {
        img_url: 'https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&h=350',
        content: rowData[index].content,
      };
      setCollapseState(!collapseState);
    }
  };

  const onPageNext = (next) => {
    if (next) {
      if (pageCount < page + 1) return;
      setPage(page + 1);
    } else {
      if (page == 1) return;
      setPage(page - 1);
    }
  };

  const onModalImage = (e, url) => {
    setImgUrl(url);
    setModalState(true);
  };

  const onSearch = (e) => {
    if (title && title.length < 2) {
      modal.alert('error', '에러', '제목명은 2글자 이상으로 입력하세요.');
      return;
    }

    request.post(`cscenter/announcement`, { category: category_str[categoryType], title }).then((ret) => {
      if (!ret.err) {
        logger.info(ret.data);

        const rowCount = ret.data.length;
        rowCount ? setDatas(() => ret.data) : setDatas([]);
        rowCount && Math.floor(rowCount / limit) ? setPageCount(Math.floor(rowCount / limit)) : setPageCount(1);
        setPage(1);
      }
    });
  };

  return (
    <>
      <Head />
      <Body title={`공지사항`} myClass={'cscenter announcement'}>
        <CSCenterNavTab active="/cscenter/announcement" className="navtab cscenter" />

        <div className="page">
          <h3>공지사항</h3>

          <div className="pagination">
            <Button onClick={(e) => onPageNext(false)} className="btn_arrow_left">
              <img src={icon_arrow_left} alt="이전 페이지" />
            </Button>
            <span>
              Page {page} of {pageCount}
            </span>
            <Button onClick={(e) => onPageNext(true)} className="btn_arrow_right">
              <img src={icon_arrow_right} alt="다음 페이지" />
            </Button>{' '}
          </div>

          <div className="inputbox">
            <DropdownButton variant="" title={category_str[categoryType]}>
              {category_str.map((name, key) => (
                <Dropdown.Item
                  key={key}
                  eventKey={key}
                  onClick={(e) => {
                    setCategoryType(key);
                  }}
                  active={categoryType === key}
                >
                  {category_str[key]}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            <input
              name="title"
              type="text"
              placeholder="제목"
              className="input_search"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
            <Button onClick={onSearch} className="btn btn_search">
              <img src={icon_search} />
            </Button>
            <Button className="btn_reset">
              <img src={icon_reset} />
            </Button>
          </div>

          <div className="tablebox">
            <table className="thead">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>카테고리</th>
                  <th>제목</th>
                </tr>
              </thead>
            </table>
            <table className="tbody">
              <tbody>
                {rowData.slice(offset, offset + limit).map((row, index) => (
                  <Fragment key={`${index}${row.title}`}>
                    <tr style={{ cursor: 'pointer' }} onClick={() => handleClick(index)}>
                      <td>{row.reg_date}</td>
                      <td>{row.announcement_category}</td>
                      <td>{row.title}</td>
                    </tr>
                    {row.other ? (
                      <tr className="toggle-row">
                        <td
                          onClick={(e) => {
                            onModalImage(e, row.other.img_url);
                          }}
                        >
                          <img src={row.other.img_url} alt="" />
                        </td>
                        <td colSpan={2}>
                          <pre>{row.other.content}</pre>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Body>
      <Footer />
      {/* 이미지모달에 엑스버튼 넣고 스타일 잡으려고 하는데 어떻게 해야하는지 모르겠습니다 ㅎㅎ */}
      <ImageModal modalState={modalState} setModalState={setModalState} imgUrl={imgUrl}></ImageModal>
    </>
  );
};

export default React.memo(Announcement);

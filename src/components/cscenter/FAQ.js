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
import icon_member from 'images/icon_member.svg';

const FAQ = () => {
  logger.render('FAQ');

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
    request.post(`cscenter/faq`, { category: category_str[categoryType], title }).then((ret) => {
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

    request.post(`cscenter/faq`, { category: category_str[categoryType], title }).then((ret) => {
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
      <Body title={``}>
        <CSCenterNavTab active="/cscenter/faq" className="navtab cscenter" />
        <span>
          <Button onClick={(e) => onPageNext(false)}>전</Button>
          page {page} of {pageCount}
          <Button onClick={(e) => onPageNext(true)}>후</Button>
        </span>

        <span>
          <Button onClick={(e) => onPageNext(true)}>전체</Button>{' '}
          <Button onClick={(e) => onPageNext(true)}>회원정보</Button>{' '}
          <Button onClick={(e) => onPageNext(true)}>이용방법</Button>{' '}
          <Button onClick={(e) => onPageNext(true)}>결제</Button>{' '}
          <Button onClick={(e) => onPageNext(true)}>기타</Button>{' '}
          <input
            name="title"
            type="text"
            placeholder="제목명"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
          <Button onClick={onSearch}>찾기</Button>
        </span>
        <table className="table faq">
          <thead>
            <tr>
              <th>카테고리</th>
              <th>제목</th>
            </tr>
          </thead>
          <tbody>
            {rowData.slice(offset, offset + limit).map((row, index) => (
              <Fragment key={`${index}${row.title}`}>
                <tr style={{ cursor: 'pointer' }} onClick={() => handleClick(index)}>
                  <td>{row.faq_category}</td>
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
                    <td colSpan={2}>{row.other.content}</td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </Body>
      <Footer />
      <ImageModal modalState={modalState} setModalState={setModalState} imgUrl={imgUrl}></ImageModal>
    </>
  );
};

export default React.memo(FAQ);

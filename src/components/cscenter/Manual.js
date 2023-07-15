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

const Manual = () => {
  logger.render('Manual');

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
  const category_str = ['전체', '기초정보관리', '상품관리', '손익관리', '계산기', '기타'];
  //

  // pagination
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const offset = (page - 1) * limit;
  //

  useEffect(() => {}, []);

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

  const onReset = () => {
    setDatas([]);
    setPage(1);
    setCategoryType(0);
    setTitle('');
  };
  const onChangeCategoryType = (type) => {
    setCategoryType(type);
  };

  return (
    <>
      <Head />
      <Body title={`사용방법`} myClass={'cscenter manual'}>
        <CSCenterNavTab active="/cscenter/manual" />

        <div className="page">
          <h3>사용방법</h3>

          <div className="pagination">
            <Button onClick={(e) => onPageNext(false)} className="btn_arrow_left">
              <img src={icon_arrow_left} alt="이전 페이지" />
            </Button>
            <span>
              Page {page} of {pageCount}
            </span>
            <Button onClick={(e) => onPageNext(true)} className="btn_arrow_right">
              <img src={icon_arrow_right} alt="다음 페이지" />
            </Button>
          </div>

          <div className="inputbox">
            {/* default 전체, 
            다른버튼 클릭하여 조회기간 변경 시 해당 버튼에 btn_blue 클래스 넣어주시면 됩니다~  
            
              여기가 조회기간이 아니라 카테고리인데, 아래 className="period" 바꿔도 작동 문제 없이 되나요..?
            */}
            <div className="period">
              {category_str.map((name, key) => (
                <Button onClick={(e) => onChangeCategoryType(key)} className={categoryType == key ? 'btn_blue' : ''}>
                  {name}
                </Button>
              ))}
            </div>
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
            <Button className="btn_reset" onClick={onReset}>
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
              <tbody></tbody>
            </table>
          </div>
        </div>
      </Body>
      <Footer />
      <ImageModal modalState={modalState} setModalState={setModalState} imgUrl={imgUrl}></ImageModal>
    </>
  );
};

export default React.memo(Manual);

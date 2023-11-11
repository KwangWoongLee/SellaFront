import React, { useState, useEffect, Fragment } from 'react';

import { Button } from 'react-bootstrap';
import Head from 'components/template/Head';
import Head_NoLogin from 'components/template/Head_NoLogin';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import com, { img_src, is_authed } from 'util/com';
import request from 'util/request';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import _ from 'lodash';
import ImageModal from 'components/common/ImageModal';

import { logger } from 'util/com';

import 'styles/CSCenter.scss';

import icon_arrow_left from 'images/icon_arrow_left.svg';
import icon_arrow_right from 'images/icon_arrow_right.svg';
import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

const Manual = () => {
  //logger.debug('Manual');

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

  useEffect(() => {
    request
      .post(`cscenter/manual`, {
        category: category_str[categoryType] == '전체' ? '' : category_str[categoryType],
        title,
      })
      .then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);
          const rowCount = data.length;
          rowCount ? setDatas(() => data) : setDatas([]);
          rowCount && Math.floor(rowCount / limit) ? setPageCount(Math.floor(rowCount / limit)) : setPageCount(1);
          setPage(1);
        }
      });
  }, []);

  useEffect(() => {
    if (rowData && rowData.length > 0) {
      const nav_clicked_row_idx = com.storage.getItem('nav_manual');
      if (nav_clicked_row_idx) {
        const findIndex = _.findIndex(rowData, (row) => row.idx == nav_clicked_row_idx);
        if (findIndex != -1) {
          handleClick(findIndex);
          com.storage.setItem('nav_manual', '');
        }
      }
    }
  }, [rowData]);

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

  const handleClick = (index) => {
    const updatedState = rowData[index];

    if (updatedState.other) {
      delete updatedState.other;
      setCollapseState(!collapseState);
    } else {
      updatedState.other = {
        img_url: rowData[index].img_url1,
        content: rowData[index].content,
      };
      setCollapseState(!collapseState);
    }
  };

  const onSearch = (e) => {
    if (title && title.length < 2) {
      alert('제목명은 2글자 이상으로 입력하세요.');
      return;
    }

    request
      .post(`cscenter/manual`, {
        category: category_str[categoryType] == '전체' ? '' : category_str[categoryType],
        title,
      })
      .then((ret) => {
        if (!ret.err) {
          const { data } = ret.data;
          logger.info(data);

          const rowCount = data.length;
          rowCount ? setDatas(() => data) : setDatas([]);
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
      {is_authed() ? <Head /> : <Head_NoLogin />}
      <Body title={`사용방법`} myClass={'cscenter manual'}>
        <CSCenterNavTab active="/cscenter/manual" />

        <div className="page">
          <h3>사용방법</h3>

          <div className="pagination">
            <Button onClick={(e) => onPageNext(false)} className="btn_arrow_left">
              <img src={`${img_src}${icon_arrow_left}`} alt="이전 페이지" />
            </Button>
            <span>
              Page {page} of {pageCount}
            </span>
            <Button onClick={(e) => onPageNext(true)} className="btn_arrow_right">
              <img src={`${img_src}${icon_arrow_right}`} alt="다음 페이지" />
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
              <img src={`${img_src}${icon_search}`} />
            </Button>
            <Button className="btn_reset" onClick={onReset}>
              <img src={`${img_src}${icon_reset}`} />
            </Button>
          </div>

          <div className="tablebox">
            <table className="thead">
              <thead>
                <tr>
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
                      <td>{row.manual_category}</td>
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
          </div>
        </div>
      </Body>
      <Footer />
      <ImageModal modalState={modalState} setModalState={setModalState} imgUrl={imgUrl}></ImageModal>
    </>
  );
};

export default React.memo(Manual);

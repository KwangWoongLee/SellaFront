import React, { useState, useEffect, Fragment } from 'react';

import 'styles/CSCenter.scss';

import { Button } from 'react-bootstrap';
import Head from 'components/template/Head';
import Head_NoLogin from 'components/template/Head_NoLogin';
import Body from 'components/template/Body';
import Footer from 'components/template/Footer';
import { img_src, modal, is_authed } from 'util/com';
import request from 'util/request';
import CSCenterNavTab from 'components/cscenter/CSCenterNavTab';
import _ from 'lodash';
import ImageModal from 'components/common/ImageModal';

import com, { logger, time_format } from 'util/com';

import icon_arrow_left from 'images/icon_arrow_left.svg';
import icon_arrow_right from 'images/icon_arrow_right.svg';
import icon_search from 'images/icon_search.svg';
import icon_reset from 'images/icon_reset.svg';

const Announcement = () => {
  //logger.debug('Announcement');

  const [modalState, setModalState] = useState(false);
  const [imgUrl, setImgUrl] = useState('');

  //row control
  const [collapseState, setCollapseState] = useState(false);
  const [rowData, setDatas] = useState([]);
  //

  // search input
  const [categoryType, setCategoryType] = useState(0);
  const [title, setTitle] = useState('');
  const category_str = ['전체', '일반', '테스트'];
  //

  // pagination
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const offset = (page - 1) * limit;
  //

  useEffect(() => {
    request
      .post(`cscenter/announcement`, {
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
      const nav_clicked_row_idx = com.storage.getItem('nav_announcement');
      if (nav_clicked_row_idx) {
        const findIndex = _.findIndex(rowData, (row) => row.idx == nav_clicked_row_idx);
        if (findIndex != -1) {
          handleClick(findIndex);
          com.storage.setItem('nav_announcement', '');
        }
      }
    }
  }, [rowData]);

  useEffect(() => {
    onSearch();
  }, [categoryType]);

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
      modal.alert('제목명은 2글자 이상 입력해 주세요.');
      return;
    }

    request
      .post(`cscenter/announcement`, {
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
    // setDatas([]);
    setPage(1);
    setCategoryType(0);
    setTitle('');
  };
  const onChangeCategoryType = (type) => {
    setTitle('');
    setCategoryType(type);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  return (
    <>
      {is_authed() ? <Head /> : <Head_NoLogin />}
      <Body title={`공지사항`} myClass={'cscenter announcement'}>
        <CSCenterNavTab active="/cscenter/announcement" className="navtab cscenter" />

        <div className="page">
          <h3>공지사항</h3>

          <div className="pagination pc">
            <Button onClick={(e) => onPageNext(false)} className="btn_arrow_left">
              <img src={`${img_src}${icon_arrow_left}`} alt="이전 페이지" />
            </Button>
            <span>
              Page {page} of {pageCount}
            </span>
            <Button onClick={(e) => onPageNext(true)} className="btn_arrow_right">
              <img src={`${img_src}${icon_arrow_right}`} alt="다음 페이지" />
            </Button>{' '}
          </div>

          <div className="inputbox">
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
              className="input_search pc"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={onSearch} className="btn btn_search pc">
              <img alt={''} src={`${img_src}${icon_search}`} />
            </Button>
            <Button className="btn_reset pc" onClick={onReset}>
              <img alt={''} src={`${img_src}${icon_reset}`} />
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
                      <td>{time_format(row.reg_date)}</td>
                      <td>{row.announcement_category}</td>
                      <td>{row.title}</td>
                    </tr>
                    {row.other ? (
                      <tr className="toggle-row">
                        <td
                          className={row.other.img_url ? '' : 'empty'}
                          onClick={
                            row.other.img_url
                              ? (e) => {
                                  onModalImage(e, row.other.img_url);
                                }
                              : () => {}
                          }
                        >
                          {row.other.img_url ? <img alt={''} src={row.other.img_url} /> : <></>}
                        </td>
                        <td colSpan={2}>
                          <pre>
                            {_.split(row.other.content, '\n').map((d, key) => {
                              return (
                                <>
                                  {d}
                                  <br></br>
                                </>
                              );
                            })}
                          </pre>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination mobile">
            <Button onClick={(e) => onPageNext(false)} className="btn_arrow_left">
              <img src={`${img_src}${icon_arrow_left}`} alt="이전 페이지" />
            </Button>
            <span>
              Page {page} of {pageCount}
            </span>
            <Button onClick={(e) => onPageNext(true)} className="btn_arrow_right">
              <img src={`${img_src}${icon_arrow_right}`} alt="다음 페이지" />
            </Button>{' '}
          </div>

          <div className="inputbox mobile">
            <input
              name="title"
              type="text"
              placeholder="제목"
              className="input_search "
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
            <Button onClick={onSearch} className="btn btn_search">
              <img alt={''} src={`${img_src}${icon_search}`} />
            </Button>
            <Button className="btn_reset pc" onClick={onReset}>
              <img alt={''} src={`${img_src}${icon_reset}`} />
            </Button>
          </div>
        </div>
      </Body>
      <Footer />
      {/* 이미지모달에 엑스버튼 넣고 스타일 잡으려고 하는데 어떻게 해야하는지 모르겠습니다 ㅎㅎ 
      
          이미지 모달은 src < components < common 폴더 안에있는 ImageModal.js 건드리시면 되세요ㅎㅎ
          샘플 닫기버튼 만들어 놓았어요!    

          처리되면 지워주세요       
      */}

      <ImageModal modalState={modalState} setModalState={setModalState} imgUrl={imgUrl}></ImageModal>
    </>
  );
};

export default React.memo(Announcement);

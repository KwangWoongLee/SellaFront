import React, { useEffect, useState } from 'react';

import 'styles/Manager.scss';
import Head from 'components/template/Head';
import Footer from 'components/template/Footer';
import Body from 'components/template/Body';
import { logger, modal } from 'util/com';

import { Table, Button, Modal, Form, FloatingLabel, DropdownButton, Dropdown, InputGroup } from 'react-bootstrap';
import request from 'util/request';
import { BsFillPeopleFill } from 'react-icons/bs';
import _ from 'lodash';

const grade_str = ['NONE', 'NORMAL', 'LOGVIEW', 'ADMIN', 'SUPER ADMIN'];

const MgrAccount = () => {
  logger.render('MgrAccount');

  const [accs, setAccs] = useState([]);
  const [modal_state, setModalState] = useState({ show: false, acc: null });
  const [modify, setModify] = useState(false);

  useEffect(() => {}, []);

  useEffect(() => {
    // request_page();
  }, []);

  const request_page = () => {
    request.post('login', {}).then((ret) => {
      if (!ret.err) {
        setAccs(ret.data.data);
      }
    });
  };

  const onInsert = () => {
    setModalState({ show: true, acc: null });
  };
  const onDelete = (e) => {
    const nodes = e.currentTarget.parentNode.parentNode.childNodes;
    const idx = nodes[1].innerText;
    const email = nodes[2].innerText;

    modal.alert('info', `${email}계정 삭제`, `${email} 계정을 삭제합니다.`, () =>
      request.post(`manager/account/delete`, { idx }).then((ret) => {
        if (!ret.err) {
          request_page();
        }
      })
    );
  };

  const onModify = (e) => {
    e.preventDefault();
    setModify(true);

    const nodes = e.currentTarget.parentNode.parentNode.childNodes;
    const idx = nodes[1].innerText;
    const id = nodes[2].innerText;
    const password = nodes[3].innerText;
    const naver_id = nodes[4].innerText;
    const naver_password = nodes[5].innerText;
    const auth = nodes[6].innerText;
    const project = nodes[7].innerText;
    const coupang_access_key = nodes[8].innerText;
    const coupang_secret_key = nodes[9].innerText;
    const coupang_vendor_id = nodes[10].innerText;

    setModalState({
      show: true,
      data: {
        idx,
        id,
        password,
        naver_id,
        naver_password,
        auth,
        project,
        coupang_access_key,
        coupang_secret_key,
        coupang_vendor_id,
      },
    });
  };

  return (
    <>
      <Head />
      <Body title="툴계정">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>
                <Button variant="success" onClick={onInsert}>
                  추가
                </Button>
              </th>
              <th>IDX</th>
              <th>ID</th>
              <th>비밀번호</th>
              <th>네이버 ID</th>
              <th>네이버 비밀번호</th>
              <th>권한</th>
              <th>프로젝트</th>
              <th>쿠팡 액세스 키</th>
              <th>쿠팡 시크릿 키</th>
              <th>쿠팡 벤더 ID</th>
            </tr>
          </thead>
          <tbody>
            {accs.map((d, key) => (
              <TableItem key={key} d={d} onDelete={onDelete} onModify={onModify} />
            ))}
          </tbody>
        </Table>
        <InputModal
          modify={modify}
          setModify={setModify}
          modal_state={modal_state}
          setModalState={setModalState}
          request_page={request_page}
        />
      </Body>
      <Footer />
    </>
  );
};

const TableItem = React.memo(({ d, onModify, onDelete }) => {
  //logger.render('MgrBot TableItem : ', d.aidx);
  return (
    <tr>
      <td>
        <Button variant="secondary" onClick={onDelete} name={d.idx}>
          삭제
        </Button>{' '}
        <Button variant="primary" onClick={onModify} name={d.idx}>
          수정
        </Button>
      </td>
      <td>{d.idx}</td>
      <td>{d.id}</td>
      <td>{d.password}</td>
      <td>{d.naver_id}</td>
      <td>{d.naver_password}</td>
      <td>{d.auth}</td>
      <td>{d.project}</td>
      <td>{d.coupang_access_key}</td>
      <td>{d.coupang_secret_key}</td>
      <td>{d.coupang_vendor_id}</td>
    </tr>
  );
});

const InputModal = React.memo(({ modify, setModify, modal_state, setModalState, request_page }) => {
  logger.render('MgrAccount InputModal');
  const [grade, setGrade] = useState(0);

  useEffect(() => {
    if (modal_state.show) {
      setGrade(modal_state.acc ? modal_state.acc.grade : 1);
    }
  }, [modal_state]);

  const onSubmit = (e) => {
    e.preventDefault();

    const idx = e.currentTarget[0].value;
    const id = e.currentTarget[1].value;
    const password = e.currentTarget[2].value;
    const naver_id = e.currentTarget[3].value;
    const naver_password = e.currentTarget[4].value;
    const auth = e.currentTarget[5].value;
    const project = e.currentTarget[6].value;
    const coupang_access_key = e.currentTarget[7].value;
    const coupang_secret_key = e.currentTarget[8].value;
    const coupang_vendor_id = e.currentTarget[9].value;

    if (modify) {
      request
        .post('manager/account/modify', {
          idx,
          id,
          password,
          naver_id,
          naver_password,
          auth,
          project,
          coupang_access_key,
          coupang_secret_key,
          coupang_vendor_id,
        })
        .then((ret) => {
          if (!ret.err) {
            request_page();
            onClose();
          }
        });
      setModify(false);
    } else {
      request
        .post('manager/account/insert', {
          id,
          password,
          naver_id,
          naver_password,
          auth,
          project,
          coupang_access_key,
          coupang_secret_key,
          coupang_vendor_id,
        })
        .then((ret) => {
          if (!ret.err) {
            request_page();
            onClose();
          }
        });
    }
  };

  const onClose = () => setModalState((state) => ({ ...state, show: false }));

  const onChange = (grade) => {
    setGrade(Number(grade) + 1);
  };

  return (
    <Modal show={modal_state.show} onHide={onClose} centered>
      <Modal.Header className="d-flex justify-content-center">
        <Modal.Title className="text-primary">
          <div>{'계정 추가'}</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit} id="acc-form">
          <div>
            {' '}
            <FloatingLabel label="IDX" className="mb-1">
              <Form.Control
                type="text"
                placeholder="idx"
                disabled={true}
                defaultValue={modal_state.data ? modal_state.data.idx : ''}
              />
            </FloatingLabel>
            <FloatingLabel label="ID" className="mb-1">
              <Form.Control type="text" placeholder="id" defaultValue={modal_state.data ? modal_state.data.id : ''} />
            </FloatingLabel>
            <FloatingLabel label="비밀번호" className="mb-1">
              <Form.Control
                type="text"
                placeholder="password"
                defaultValue={modal_state.data ? modal_state.data.password : ''}
              />
            </FloatingLabel>
            <FloatingLabel label="네이버 ID" className="mb-1">
              <Form.Control
                type="text"
                placeholder="naver_id"
                defaultValue={modal_state.data ? modal_state.data.naver_id : ''}
              />
            </FloatingLabel>
            <FloatingLabel label="네이버 비밀번호" className="mb-1">
              <Form.Control
                type="text"
                placeholder="naver_password"
                defaultValue={modal_state.data ? modal_state.data.naver_password : ''}
              />
            </FloatingLabel>
            <FloatingLabel label="권한" className="mb-1">
              <Form.Control
                type="text"
                placeholder="auth"
                defaultValue={modal_state.data ? modal_state.data.auth : ''}
              />
            </FloatingLabel>
            <FloatingLabel label="프로젝트" className="mb-1">
              <Form.Control
                type="text"
                placeholder="project"
                defaultValue={modal_state.data ? modal_state.data.project : ''}
              />
            </FloatingLabel>
            <FloatingLabel label="쿠팡 액세스키" className="mb-1">
              <Form.Control
                type="text"
                placeholder="coupang_access_key"
                defaultValue={modal_state.data ? modal_state.data.coupang_access_key : ''}
              />
            </FloatingLabel>
            <FloatingLabel label="쿠팡 시크릿키" className="mb-1">
              <Form.Control
                type="text"
                placeholder="coupang_secret_key"
                defaultValue={modal_state.data ? modal_state.data.coupang_secret_key : ''}
              />
            </FloatingLabel>
            <FloatingLabel label="쿠팡 벤더ID" className="mb-1">
              <Form.Control
                type="text"
                placeholder="coupang_vendor_id"
                defaultValue={modal_state.data ? modal_state.data.coupang_vendor_id : ''}
              />
            </FloatingLabel>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" type="submit" form="acc-form">
          저장
        </Button>
        <Button variant="secondary" onClick={onClose}>
          취소
        </Button>
      </Modal.Footer>
    </Modal>
  );
});

export default React.memo(MgrAccount);

import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FcOk, FcCancel, FcInfo } from 'react-icons/fc';
import Recoils from 'recoils';
import { logger } from 'util/com';

import 'styles/Modal.scss';

const getClassName = (type) => {
  if (type === 'error') return 'text-danger';
  else if (type === 'info') return 'text-secondary';
  else if (type === 'success') return 'text-success';
  else return '';
};
const Icon = ({ type }) => {
  if (type === 'error') return <FcCancel />;
  else if (type === 'info') return <FcInfo />;
  else if (type === 'success') return <FcOk />;
  else return null;
};

const AlertModal = () => {
  const [state, setState] = Recoils.useState('ALERT');
  logger.render('AlertModal : ', state.show);

  const action = (func) =>
    setTimeout(() => {
      func();
    }, 500);

  const onClose = () => {
    setState({ show: false });
    //if (state.buttons[0].action) action(state.buttons[0].action);
  };

  const onClick = (func) => {
    setState({ ...state, show: false });
    if (func) action(func);
  };

  return (
    <Modal show={state.show} onHide={onClose} centered className="Alert">
      {state.title && (
        <Modal.Header closeButton>
          <Modal.Title>
            <div className="d-flex align-items-center">
              <Icon type={state.type} /> <span className={getClassName(state.type)}>{state.title}</span>
            </div>
          </Modal.Title>
        </Modal.Header>
      )}
      {state.msg && (
        <Modal.Body>
          <Form.Control
            className={`${getClassName(state.type)} bg-white`}
            as="textarea"
            rows={get_rows(state.msg)}
            defaultValue={state.msg}
            readOnly
          />
        </Modal.Body>
      )}
      {state.buttons && (
        <Modal.Footer>
          {state.buttons.map((b) => (
            <Button key={b.key} variant={get_variant(b.key)} onClick={() => onClick(b.action)}>
              {b.name}
            </Button>
          ))}
        </Modal.Footer>
      )}
    </Modal>
  );
};

const get_rows = (msg) => {
  if (!msg) return 1;
  const rows = msg.split('\n').length;
  return rows > 10 ? 10 : rows;
};

const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info'];
const get_variant = (key) => variants[key % variants.length];

export default React.memo(AlertModal);

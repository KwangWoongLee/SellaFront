import React from 'react';
import { logger } from 'util/com';
import { Button, DropdownButton, Dropdown, Modal, Form, InputGroup, FloatingLabel } from 'react-bootstrap';

import { img_src } from 'util/com';
import icon_close from 'images/icon_close.svg';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const CommonSliderModal = React.memo(({ modalState, setModalState, slider_settings, datas }) => {
  //logger.debug('CommonSliderModal');

  const onClose = () => setModalState(false);

  return (
    <>
      <Modal show={modalState} onHide={onClose} centered className="slidermodal">
        <Modal.Header className="d-flex justify-content-center">
          <Modal.Title className="text-primary"></Modal.Title>
          <Button onClick={onClose} variant="primary" className="btn_close">
            <img alt={''} src={`${img_src}${icon_close}`} />
          </Button>
        </Modal.Header>

        <Modal.Body>
          <Slider {...slider_settings}>
            {datas &&
              datas.map((data, key) => (
                <div>
                  <h3>{data}</h3>
                </div>
              ))}
          </Slider>
        </Modal.Body>
      </Modal>
    </>
  );
});
export default React.memo(CommonSliderModal);

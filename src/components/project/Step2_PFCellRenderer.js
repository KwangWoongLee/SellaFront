import { useState, useRef } from 'react';
import React from 'react';
import Tippy from '@tippyjs/react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import _ from 'lodash';

const PopupCellRenderer = (props) => {
  const tippyRef = useRef();
  const [visible, setVisible] = useState(false);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  // TODO :: 뭔가 오작동.. 최적화 필요
  const pf_str = _.map(props.pf_category, 'packing_category');
  let selectIdx = _.indexOf(pf_str, props.data.packing_descript);
  if (selectIdx < 0) selectIdx = 0;

  const [selectType, setSelectType] = useState(selectIdx);

  const dropDownContent = (
    <>
      {pf_str.map((name, key) => (
        <Dropdown.Item
          key={key}
          eventKey={key}
          onClick={() => {
            setSelectType(key);
            setVisible(false);
          }}
          active={selectType === key}
        >
          {pf_str[key]}
        </Dropdown.Item>
      ))}
    </>
  );

  return (
    <>
      <Tippy
        ref={tippyRef}
        content={dropDownContent}
        visible={visible}
        onClickOutside={hide}
        allowHTML={true}
        arrow={false}
        appendTo={document.body}
        interactive={true}
        placement="bottom"
      >
        <DropdownButton
          style={{ display: 'inline-block' }}
          variant=""
          title={pf_str && pf_str[selectType]}
          onClick={visible ? hide : show}
        ></DropdownButton>
      </Tippy>
      <input
        style={{ display: 'inline-block' }}
        defaultValue={
          props.pf_category && props.pf_category[selectType] ? props.pf_category[selectType].packing_fee : 0
        }
        disabled={pf_str.length && selectType == pf_str.length - 1 ? false : true}
      ></input>
      <span>원</span>
    </>
  );
};

export default React.memo(PopupCellRenderer);

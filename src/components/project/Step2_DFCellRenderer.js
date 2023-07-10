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

  const df_str = _.map(props.df_category, 'delivery_category');
  let selectIdx = _.indexOf(df_str, props.data.delivery_descript);
  if (selectIdx < 0) selectIdx = 0;

  const [selectType, setSelectType] = useState(selectIdx);

  const dropDownContent = (
    <>
      {df_str.map((name, key) => (
        <Dropdown.Item
          key={key}
          eventKey={key}
          onClick={() => {
            setSelectType(key);
            setVisible(false);
          }}
          active={selectType === key}
        >
          {df_str[key]}
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
        <DropdownButton variant="" title={df_str[selectType]} onClick={visible ? hide : show}></DropdownButton>
      </Tippy>
      <input
        defaultValue={
          props.df_category && props.df_category[selectType] ? props.df_category[selectType].delivery_fee : 0
        }
        disabled={df_str.length && selectType == df_str.length - 1 ? false : true}
      ></input>
      <span>원</span>
    </>
  );
};

export default React.memo(PopupCellRenderer);

import { useEffect, useState, useRef } from 'react';
import React from 'react';
import Tippy from '@tippyjs/react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import _ from 'lodash';
import Recoils from 'recoils';

const PopupCellRenderer = (props) => {
  const tippyRef = useRef();
  const inputRef = useRef();
  const [visible, setVisible] = useState(false);
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  let df_category;
  const deliveryData = _.cloneDeep(Recoils.getState('DATA:DELIVERY'));
  if (deliveryData.length > 1) {
    df_category = deliveryData;
    df_category.push({ delivery_category: '기타', delivery_fee: 0 });
  }

  const df_str = _.map(df_category, 'delivery_category');

  let selectIdx = _.indexOf(df_str, props.data.delivery_descript);
  if (selectIdx < 0) selectIdx = 0;

  const [selectType, setSelectType] = useState(selectIdx);

  useEffect(() => {
    const selectDescript = props.data.delivery_descript;
    for (let i = 0; i < df_category.length; ++i) {
      const df_category_obj = df_category[i];
      if (df_category_obj.delivery_category == selectDescript) {
        setSelectType(i);
        break;
      }
    }
  }, []);

  useEffect(() => {
    if (df_category.length != 0 && selectType == df_category.length - 1) {
      inputRef.current.value = props.data.delivery_fee;

      props.data.delivery_descript = df_category[selectType].delivery_category;
      return;
    }

    inputRef.current.value = df_category[selectType].delivery_fee;
    props.data.delivery_descript = df_category[selectType].delivery_category;
  }, [selectType]);

  const onChangeInput = () => {
    props.data.delivery_fee = inputRef.current.value;
  };

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
        ref={inputRef}
        onChange={onChangeInput}
        disabled={df_str.length && selectType == df_str.length - 1 ? false : true}
      ></input>
      <span>원</span>
    </>
  );
};

export default React.memo(PopupCellRenderer);

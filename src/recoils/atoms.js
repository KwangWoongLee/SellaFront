import { atom } from 'recoil';

// recoil state atom
const states = [];

const insert_recoil = (key, base) => states.push(atom({ key, default: base }));

//
insert_recoil('NAV', 0);

// common
insert_recoil('SPINEER', false);
insert_recoil('ALERT', { show: false });
insert_recoil('CONFIRM', { show: false });

// modal
insert_recoil('MODAL:LOGIN', false);
insert_recoil('MODAL:ITEMSELECT', { show: false });
insert_recoil('MODAL:ITEMSELECT2', { show: false });
insert_recoil('MODAL:FILEUPLOAD', {
  show: false,
  url: '',
  accept: '',
  label: '',
  frm_data: {},
  title: null,
  cb: null,
  multiple: true,
});

// account
insert_recoil('CONFIG:ACCOUNT', {
  user: {
    login_id: '',
    aidx: 0,
  },
  email: '',
  grade: -1,
  name: '',
});

//sella common data
insert_recoil('SELLA:CATEGORIES', {
  categories: [],
});

insert_recoil('SELLA:SELLAFORMS', {
  sella_forms: [],
});

// my_datas
insert_recoil('DATA:PLATFORMS', {
  platforms: [],
});

insert_recoil('DATA:GOODS', {
  goods: [],
});

insert_recoil('DATA:FORMSMATCH', {
  forms_match: [],
});

export default states;

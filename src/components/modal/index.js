import UploadModal from 'components/modal/FileUpload';
import ItemSelectModal from 'components/modal/ItemSelect';
import ItemSelectModal2 from 'components/modal/ItemSelect2';

import ConfirmModal from 'components/common/Confirm';
import AlertModal from 'components/common/Alert';
import Spinner from 'components/common/Spinner'; // 제일끝에 둔다.
const Modals = () => {
  return (
    <>
      <ItemSelectModal />
      <ItemSelectModal2 />
      <UploadModal />
      <ConfirmModal />
      <AlertModal />
      <Spinner />
    </>
  );
};

export default Modals;

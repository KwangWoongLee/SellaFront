import UploadModal from 'components/modal/FileUpload';

import AlertModal from 'components/common/Alert';
import ConfirmModal from 'components/common/Confirm';
import Spinner from 'components/common/Spinner'; // 제일끝에 둔다.
const Modals = () => {
  return (
    <>
      <UploadModal />
      <AlertModal />
      <ConfirmModal />
      <Spinner />
    </>
  );
};

export default Modals;

import UploadModal from 'components/modal/FileUpload';

import ConfirmModal from 'components/common/Confirm';
import AlertModal from 'components/common/Alert';
import Spinner from 'components/common/Spinner'; // 제일끝에 둔다.
const Modals = () => {
  return (
    <>
      <UploadModal />
      <ConfirmModal />
      <AlertModal />
      <Spinner />
    </>
  );
};

export default Modals;

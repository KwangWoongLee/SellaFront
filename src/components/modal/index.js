import UploadModal from 'components/modal/FileUpload';

import AlertModal from 'components/common/Alert';
import CertModal from 'components/common/CertModal';
import ConfirmModal from 'components/common/Confirm';
import Spinner from 'components/common/Spinner'; // 제일끝에 둔다.
const Modals = () => {
  return (
    <>
      <UploadModal />
      <AlertModal />
      <CertModal />
      <ConfirmModal />
      <Spinner />
    </>
  );
};

export default Modals;

import Head from "next/head";
import { useEffect } from "react";

import PrivacyPolicy from "src/components/auth/privacy-policy";
import RegisterFlow from "src/components/auth/register-flow";
import TermsAndConditions from "src/components/auth/terms-and-conditions";
import TMModal from "src/components/common/modal";
import { APP_NAME } from "src/constants";
import { useModal } from "src/context/modal-context";
import { useAppDispatch } from "src/lib/hooks";
import { setTermsAndConditionsChecked } from "src/store/UiSlice";

export enum AuthTMModalView {
  PRIVACY_POLICY,
  TERMS_AND_CONDITIONS,
}

const ModalViews = {
  [AuthTMModalView.TERMS_AND_CONDITIONS]: {
    content: <TermsAndConditions />,
    title: "Terms and Conditions",
  },
  [AuthTMModalView.PRIVACY_POLICY]: {
    content: <PrivacyPolicy />,
    title: "Privacy Policy",
  },
};

function Home() {
  const { closeModal, modalOpen, modalView } = useModal();
  const ModalContent = ModalViews[modalView as keyof typeof ModalViews];
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setTermsAndConditionsChecked({ state: false }));
  }, [dispatch]);
  return (
    <div>
      <Head>
        <title>{APP_NAME}</title>
      </Head>
      <RegisterFlow />
      <TMModal
        handleClose={closeModal}
        open={modalOpen}
        showHeader
        showCloseIcon
        headerText={ModalContent?.title}
        classOverrides="max-w-[900px]"
      >
        {ModalContent?.content}
      </TMModal>
    </div>
  );
}

export default Home;


import Head from "next/head";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

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

function Home() {
  const { t } = useTranslation("common");
  const { closeModal, modalOpen, modalView } = useModal();

  const modalViews = useMemo(
    () => ({
      [AuthTMModalView.TERMS_AND_CONDITIONS]: {
        content: <TermsAndConditions />,
        title: t("terms.termsAndConditions"),
      },
      [AuthTMModalView.PRIVACY_POLICY]: {
        content: <PrivacyPolicy />,
        title: t("terms.privacyPolicy"),
      },
    }),
    [t],
  );

  const ModalContent = modalViews[modalView as keyof typeof modalViews];
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


import { useAuth0 } from "@auth0/auth0-react";
import classNames from "classnames";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";

import Button from "src/components/common/button";
import { CheckBox } from "src/components/common/checkbox";
import { useModal } from "src/context/modal-context";
import { SocialProviders } from "src/interfaces/global";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { AuthTMModalView } from "src/pages";
import { selectIsTermsAndConditionsChecked, setTermsAndConditionsChecked } from "src/store/UiSlice";

interface WithSocial {}

export const WithSocial: React.FC<WithSocial> = () => {
  const { openModal } = useModal();
  const [socialProvider, setSocialProvider] = useState<SocialProviders | null>(null);
  const dispatch = useAppDispatch();
  const isTermsAndConditionChecked = useAppSelector(selectIsTermsAndConditionsChecked);
  const { getIdTokenClaims, loginWithPopup, loginWithRedirect } = useAuth0();
  const {
    handleSubmit,
    register,
    control,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<{ terms: boolean }>({
    defaultValues: {
      terms: isTermsAndConditionChecked,
    },
  });

  const handleSubmitForm = async (data: { terms: boolean }) => {
    await loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)}>
      <Controller
        control={control}
        rules={{
          required: true,
        }}
        name="terms"
        render={({ field: { onChange, onBlur, value } }) => (
          <div className="mb-[20px] mt-[14px] flex items-center gap-[8px]">
            <CheckBox
              id="terms"
              checkBoxName="terms"
              checkBoxValue={isTermsAndConditionChecked}
              classes={classNames({
                "text-tm-danger ": errors.terms,
                "border-black": !errors.terms,
              })}
              setChecked={(checked) => {
                dispatch(setTermsAndConditionsChecked({ state: checked }));
                setValue("terms", checked, { shouldValidate: true });
              }}
            />
            <p
              className={classNames("text-[13px]", {
                "text-tm-danger ": errors.terms,
                "text-tm-black-80": !errors.terms,
              })}
            >
              I accept{" "}
              <span
                className="mr-[4px] cursor-pointer underline"
                onClick={() => openModal(AuthTMModalView.TERMS_AND_CONDITIONS)}
              >
                Terms and Conditions
              </span>
              and
              <span
                className="ml-[4px] cursor-pointer underline"
                onClick={() => openModal(AuthTMModalView.PRIVACY_POLICY)}
              >
                Privacy Policy
              </span>
            </p>
          </div>
        )}
      />

      <div className="flex flex-wrap justify-between gap-[14px] md:flex-nowrap">
        {/* <Button>
          <div className="flex w-full items-center justify-between">
            <p className="text-[13px] font-semibold leading-[1.2em]">Google</p>
            <Image height={25} width={25} src="/assets/google.webp" alt="google" />
          </div>
        </Button> */}

        {/* <Button disabled>
          <div className="flex w-full items-center justify-between">
            <p className="text-[13px] font-semibold leading-[1.2em]">Facebook</p>
            <Image height={25} width={25} src="/assets/facebook.png" alt="facebook" />
          </div>
        </Button> */}
        {/* <Button disabled>
          <div className="flex w-full items-center justify-between">
            <p className="text-[13px] font-semibold leading-[1.2em]">Linkedin</p>
            <Image height={25} width={25} src="/assets/linkedin.png" alt="linkedin" />
          </div>
        </Button> */}
      </div>
    </form>
  );
};

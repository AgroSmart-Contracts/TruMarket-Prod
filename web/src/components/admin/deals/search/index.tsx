import React, { useState } from "react";
import { FieldErrors, UseFormHandleSubmit, Control, UseFormReset } from "react-hook-form";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import Input from "src/components/common/input";
import AgreementDetailListHeader from "src/components/dashboard/agreement-details/agreement-detail-list-header";
import Button, { ButtonVariants } from "src/components/common/button";
import SelectDropDown from "src/components/common/select";
import { ValidationStates } from "src/interfaces/global";

import { IDealsFilterForm } from "..";

interface SearchProps {
  errors: FieldErrors;
  register: any;
  handleSubmit: UseFormHandleSubmit<IDealsFilterForm>;
  refetch: () => void;
  control: Control<IDealsFilterForm>;
  reset: UseFormReset<IDealsFilterForm>;
  showResetButton?: boolean;
}

const Search: React.FC<SearchProps> = ({
  errors,
  register,
  refetch,
  handleSubmit,
  control,
  reset,
  showResetButton,
}) => {
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const handleSearch = async () => {
    setLoading(true);
    await refetch();
    setLoading(false);
  };

  const handleReset = async () => {
    reset({ emailSearch: "", status: undefined });
    setResetLoading(true);
    await refetch();
    setResetLoading(false);
  };

  return (
    <div className="w-full rounded-[5px] bg-tm-white p-[30px] shadow-lg">
      <form className="flex gap-[20px]" onSubmit={handleSubmit(handleSearch)}>
        <div className="flex w-1/3 flex-col gap-[10px]">
          <AgreementDetailListHeader text="Search agreement by participants email" />
          <div className="flex items-center gap-[10px]">
            <div className="flex w-full flex-col gap-[10px]">
              <Input
                name="emailSearch"
                type="text"
                classOverrides="!bg-[#ff000000] py-[12px]"
                placeholder="Participant email address"
                register={register("emailSearch", {
                  required: false,
                })}
                hasError={Boolean(errors.emailSearch)}
                errors={errors}
              />
            </div>
          </div>
        </div>
        <div className="flex w-1/3 flex-col gap-[10px]">
          <AgreementDetailListHeader text="Search agreement by status" />
          <SelectDropDown
            id="status"
            placeHolder="Agreement status"
            state={errors.status ? ValidationStates.ERROR : ""}
            // value={inputDefaultValues.job_category?.value}
            options={[
              { label: "Pending", value: "proposal" },
              { label: "Confirmed", value: "confirmed" },
              { label: "Finished", value: "finished" },
              { label: "Cancelled", value: "cancelled" },
            ]}
            disableBorderRight
            showErrorMessage={false}
            rules={{
              required: {
                value: false,
                message: "",
              },
            }}
            control={control}
            errors={errors}
            clearable
            isRequired
          />
        </div>
        <div className="mt-[26px] flex w-1/3 items-center gap-[10px]">
          <Button classOverrides="!py-[8px]" loading={loading} disabled={loading}>
            <p>Search</p>
          </Button>

          <Button
            variant={ButtonVariants.FILLED_DANGER}
            classOverrides="!py-[8px]"
            loading={resetLoading}
            disabled={resetLoading}
            onClick={handleReset}
          >
            <div className="flex items-center gap-[5px]">
              <p className="font-bold text-tm-white">Reset Filters</p>
              {!resetLoading && <RestartAltIcon className="!text-tm-white" />}
            </div>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Search;

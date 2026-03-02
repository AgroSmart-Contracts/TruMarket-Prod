import React, { useMemo, useState } from "react";
import classNames from "classnames";
import { useForm } from "react-hook-form";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { toast } from "react-toastify";

import Input from "src/components/common/input";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { selectShipmentAgreementState, setShipmentAgreementState } from "src/store/createShipmentAgreementSlice";
import Button from "src/components/common/button";
import { milestones } from "src/lib/static";
import { CurrencyFormatter, milestoneDescriptions } from "src/lib/helpers";
import { IPaymentValuesForm } from "src/interfaces/shipment";
import FieldTitle from "src/components/common/input/field-title";

import ExtendedNextButton from "./extended-next-button";

interface PaymentValueProps {
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  selectedIndex: number;
  isBuyer: boolean;
}

type ExtendInterface<T, U extends string> = T & Record<U, string>;

type ExtendedPaymentValuesForm = ExtendInterface<IPaymentValuesForm, (typeof milestones)[number]["value"]>;

type UiMilestone = {
  id: string;
  type: "preset" | "other";
  /** key of one of the predefined milestones in `static.tsx` (e.g. production_and_fields) */
  presetKey?: string;
  /** Display name sent as `description` to the API */
  label: string;
  /** Percentage for this tranche */
  percentage: number;
};

const MIN_MILESTONE_PERCENTAGE = 10;
const MAX_MILESTONES = 10;
const MAX_OTHER_MILESTONES = 3;

const createEmptyOtherMilestone = (): UiMilestone => ({
  id: crypto.randomUUID(),
  type: "other",
  label: "",
  percentage: MIN_MILESTONE_PERCENTAGE,
});

const PaymentValues: React.FC<PaymentValueProps> = ({ setSelectedIndex, selectedIndex, isBuyer }) => {
  const dispatch = useAppDispatch();
  const shipmentFormData = useAppSelector(selectShipmentAgreementState);

  const defaultValues = {
    quantity: shipmentFormData.quantity,
    offerUnitPrice: shipmentFormData.offerUnitPrice,
    investmentAmountPercentage: shipmentFormData.investmentAmountPercentage || "100",
  };
  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<ExtendedPaymentValuesForm>({
    defaultValues,
  });

  // -------- Dynamic milestones UI state ----------

  /**
   * Initialize UI milestones from state, falling back to a single default milestone.
   * Existing deals (normalized from API) may already provide `shipmentFormData.milestones`.
   */
  const [uiMilestones, setUiMilestones] = useState<UiMilestone[]>(() => {
    const existing = shipmentFormData.milestones as
      | { description: string; fundsDistribution: number }[]
      | undefined
      | string
      | null;

    if (Array.isArray(existing) && existing.length > 0) {
      return (existing as { description: string; fundsDistribution: number }[])
        .slice(0, MAX_MILESTONES)
        .map((m) => {
          const preset = milestones.find((p) => p.label === m.description || p.value === m.description);
          return {
            id: crypto.randomUUID(),
            type: preset ? "preset" : "other",
            presetKey: preset?.value,
            label: m.description,
            percentage: m.fundsDistribution,
          };
        });
    }

    // Default: start with a single preset milestone using the first option
    const firstPreset = milestones[0];
    return [
      {
        id: crypto.randomUUID(),
        type: "preset",
        presetKey: firstPreset.value,
        label: firstPreset.label,
        percentage: 100,
      },
    ];
  });

  const usedPresetKeys = useMemo(
    () =>
      uiMilestones
        .filter((m) => m.type === "preset" && m.presetKey)
        .map((m) => m.presetKey as string),
    [uiMilestones],
  );

  const usedOtherCount = useMemo(
    () => uiMilestones.filter((m) => m.type === "other").length,
    [uiMilestones],
  );

  const milestonesTotal = useMemo(
    () =>
      uiMilestones.reduce(
        (sum, m) => sum + (Number.isNaN(m.percentage) ? 0 : m.percentage || 0),
        0,
      ),
    [uiMilestones],
  );

  const handleAddMilestone = () => {
    if (uiMilestones.length >= MAX_MILESTONES) {
      toast.error(`You can add up to ${MAX_MILESTONES} milestones.`);
      return;
    }

    // Prefer an unused preset milestone if available
    const availablePreset = milestones.find((m) => !usedPresetKeys.includes(m.value));
    if (availablePreset) {
      setUiMilestones((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          type: "preset",
          presetKey: availablePreset.value,
          label: availablePreset.label,
          percentage: MIN_MILESTONE_PERCENTAGE,
        },
      ]);
      return;
    }

    // Otherwise fall back to "Other" milestones (max 3)
    if (usedOtherCount >= MAX_OTHER_MILESTONES) {
      toast.error(`You can add up to ${MAX_OTHER_MILESTONES} "Other" milestones.`);
      return;
    }

    setUiMilestones((prev) => [...prev, createEmptyOtherMilestone()]);
  };

  const handleRemoveMilestone = (id: string) => {
    setUiMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleChangePreset = (id: string, value: string) => {
    setUiMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;

        if (value === "other") {
          return {
            ...m,
            type: "other",
            presetKey: undefined,
            label: "",
          };
        }

        const preset = milestones.find((p) => p.value === value);
        if (!preset) return m;

        return {
          ...m,
          type: "preset",
          presetKey: preset.value,
          label: preset.label,
        };
      }),
    );
  };

  const handleChangeLabel = (id: string, label: string) => {
    setUiMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, label } : m)),
    );
  };

  const handleChangePercentage = (id: string, rawValue: string) => {
    // Strip leading zeros while typing (e.g. 002 -> 2)
    const valueStr = rawValue.replace(/^0+(?=\d)/, "");

    if (valueStr === "") {
      // Allow empty while the user is typing; we'll validate on submit
      setUiMilestones((prev) =>
        prev.map((m) => (m.id === id ? { ...m, percentage: NaN as unknown as number } : m)),
      );
      return;
    }

    let percentage = Number(valueStr);
    if (Number.isNaN(percentage)) {
      percentage = 0;
    }

    // Clamp to 0–100 while typing; min-10 is enforced on submit
    const safe = Math.max(0, Math.min(100, percentage));

    setUiMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, percentage: safe } : m)),
    );
  };

  const handleNextStep = async (data: ExtendedPaymentValuesForm) => {
    // Validate milestones before persisting anything
    if (!uiMilestones.length) {
      toast.error("Please add at least one milestone.");
      return;
    }

    if (uiMilestones.some((m) => m.percentage < MIN_MILESTONE_PERCENTAGE)) {
      toast.error(`Each milestone must be at least ${MIN_MILESTONE_PERCENTAGE}%`);
      return;
    }

    if (uiMilestones.some((m) => !m.label?.trim())) {
      toast.error("Please provide a name for all milestones.");
      return;
    }

    if (milestonesTotal !== 100) {
      toast.error("Milestone percentages must add up to 100%.");
      return;
    }

    // Backend expects at least 7 milestones (one for each predefined milestone).
    // Start with the 7 base milestones, all set to 0%, then overlay the user's choices.
    const baseMilestones = milestoneDescriptions.map((description) => ({
      description,
      fundsDistribution: 0,
    }));

    uiMilestones.forEach((m) => {
      const percentage = Number.isNaN(m.percentage) ? 0 : m.percentage || 0;

      if (m.type === "preset" && m.presetKey) {
        const idx = milestoneDescriptions.indexOf(m.presetKey);
        if (idx !== -1) {
          baseMilestones[idx] = {
            description: milestoneDescriptions[idx],
            fundsDistribution: percentage,
          };
          return;
        }
      }

      // For "other" milestones or presets not in the first 7, append as extra entries.
      baseMilestones.push({
        description: m.label.trim(),
        fundsDistribution: percentage,
      });
    });

    const milestonesPayload = baseMilestones;

    dispatch(
      setShipmentAgreementState({
        field: "milestones",
        value: milestonesPayload,
      }),
    );

    Object.keys(data).forEach((key) => {
      dispatch(
        setShipmentAgreementState({
          field: key,
          value: data[key as keyof ExtendedPaymentValuesForm],
        }),
      );
    });
      setSelectedIndex((prev) => prev + 1);
  };

  return (
    <form onSubmit={handleSubmit(handleNextStep)}>
        <div className="flex flex-col gap-[12px]">
          <div className="flex flex-col gap-[5px]">
            <FieldTitle>
              How many units are you {isBuyer ? "buying" : "selling"}?{" "}
              <span className="font-medium">({shipmentFormData.presentation})</span>
            </FieldTitle>
            <Input
              name="quantity"
              classOverrides="!bg-[#ff000000]"
              placeholder={`Units to ${isBuyer ? "buy" : "sell"}`}
              register={register("quantity", {
                required: "field is required!",
              })}
              type="number"
              step="0.01"
              hasError={Boolean(errors.quantity)}
              errors={errors}
            />
          </div>
          <div className="flex flex-col gap-[5px]">
            <FieldTitle>
              Price per unit <span className="font-medium">({shipmentFormData.presentation})</span>
            </FieldTitle>
            <Input
              name="offerUnitPrice"
              classOverrides="!bg-[#ff000000]"
              placeholder="Price per unit"
              register={register("offerUnitPrice", {
                required: "field is required!",
              })}
              step="0.01"
              type="number"
              hasError={Boolean(errors.offerUnitPrice)}
              placeHolderRight="USD"
              errors={errors}
            />
          </div>
          <div className="relative">
            <FieldTitle classOverrides="mb-[5px]">Payment tranches at the end of the milestones</FieldTitle>
          <div className="rounded-[4px] border-b border-l border-r border-b-tm-black-20 border-l-tm-black-20 border-r-tm-black-20">
            {uiMilestones.map((milestone, index) => {
              const availablePresets = milestones.filter(
                (m) =>
                  !usedPresetKeys.includes(m.value) ||
                  m.value === milestone.presetKey,
              );

              const showOtherInput = milestone.type === "other";

              return (
                <div className="flex items-stretch" key={milestone.id}>
                  <div className="w-full border-t border-tm-black-20 px-[10px] py-[8px]">
                    <select
                      className="w-full bg-transparent text-[13px] leading-[1.2em] text-tm-black-80 outline-none"
                      value={milestone.type === "other" ? "other" : milestone.presetKey}
                      onChange={(e) => handleChangePreset(milestone.id, e.target.value)}
                    >
                      {availablePresets.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                      {/* Others option */}
                      <option value="other">Others</option>
                    </select>
                  </div>
                  {showOtherInput && (
                    <div className="w-full border-t border-l border-tm-black-20 border-l-tm-black-20 px-[10px] py-[8px]">
                      <input
                        className="w-full bg-transparent text-[13px] leading-[1.2em] text-tm-black-80 outline-none placeholder:text-tm-black-20"
                        type="text"
                        placeholder="Milestone name"
                        value={milestone.label}
                        onChange={(e) => handleChangeLabel(milestone.id, e.target.value)}
                      />
                    </div>
                  )}
                  <div className="relative w-[20%] !min-w-[20%] border-l border-t border-l-tm-black-20 border-t-tm-black-20">
                    <input
                      className="w-full bg-[#ff000000] py-[8px] pr-[18px] text-right text-[13px] text-tm-black-80 outline-none placeholder:font-normal placeholder:text-tm-black-20"
                      type="number"
                      value={Number.isNaN(milestone.percentage) ? "" : milestone.percentage}
                      onChange={(e) => handleChangePercentage(milestone.id, e.target.value)}
                    />
                    <span className="pointer-events-none absolute right-[6px] top-[8px] text-[13px] font-normal text-tm-black-80">
                      %
                    </span>
                  </div>
                  <div className="flex items-center border-t border-l border-tm-black-20 border-l-tm-black-20 px-2">
                    <button
                      type="button"
                      className={classNames("text-xs", {
                        "text-tm-danger": uiMilestones.length > 1,
                        "text-tm-black-20 cursor-not-allowed": uiMilestones.length === 1,
                      })}
                      disabled={uiMilestones.length === 1}
                      onClick={() => handleRemoveMilestone(milestone.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-start">
            <button
              type="button"
              className="text-[13px] font-medium text-tm-green underline"
              onClick={handleAddMilestone}
              disabled={uiMilestones.length >= MAX_MILESTONES}
            >
              + Add milestone
            </button>
          </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[13px]  font-normal leading-[1.2em]">
              Total agreement value :{" "}
              <span className="notranslate font-bold text-tm-black-80">
                {CurrencyFormatter(Number(watch("quantity") || 0) * Number(watch("offerUnitPrice") || 0)) || "-"}
              </span>{" "}
            </p>
          <p className="text-[13px] font-normal text-tm-black-80">
              Total:{" "}
            <span className="notranslate">{milestonesTotal || 0}</span>%
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[13px]  font-normal leading-[1.2em]">
              Investment amount :{" "}
              <span className="notranslate font-bold text-tm-black-80">
                {CurrencyFormatter(
                  Number(watch("quantity") || 0) *
                    Number(watch("offerUnitPrice") || 0) *
                    (Number(watch("investmentAmountPercentage") || 0) / 100),
                ) || "-"}
              </span>{" "}
            </p>
            <div className="flex items-center gap-2">
              <Input
                name="investmentAmountPercentage"
                classOverrides="!bg-[#ff000000]"
                placeholder="Investment Amount Percentage"
                register={register("investmentAmountPercentage", {
                  required: "field is required!",
                })}
                hasError={Boolean(errors.investmentAmountPercentage)}
                errors={errors}
                type="range"
                min="0"
                max="100"
                step="1"
              />
              <span>{Number(watch("investmentAmountPercentage"))} %</span>
            </div>
          </div>
        </div>

      <div className="mt-[30px] flex gap-[10px] items-center">
        <div className="!w-auto">
          <Button
            onClick={() => setSelectedIndex((prev) => prev - 1)}
            classOverrides="!h-[40px] !py-2 sm:!py-2.5"
          >
            <ChevronLeftIcon />
          </Button>
        </div>
        <ExtendedNextButton />
      </div>
    </form>
  );
};

export default PaymentValues;

import React from "react";

interface PaymentTrancheProps {
  register?: any;
  isTableValuesRequired?: boolean;
  milestones: {
    id: string;
    value: string;
    label: string;
  }[];
}

const PaymentTranche: React.FC<PaymentTrancheProps> = ({ milestones, register, isTableValuesRequired = false }) => {
  return (
    <div className="rounded-[4px] border-b border-l border-r border-b-tm-black-20 border-l-tm-black-20 border-r-tm-black-20">
      {milestones.map((milestone, i) => (
        <div className="flex items-center" key={i}>
          <div className="w-[70%]  border-t border-tm-black-20  border-t-tm-black-20 px-[10px] py-[8px]">
            <p className="overflow-hidden whitespace-nowrap text-[13px] leading-[1.2em] text-tm-black-80">
              {milestone.label}
            </p>
          </div>
          <div className="relative w-[30%] border-l border-t  border-l-tm-black-20 border-t-tm-black-20">
            <input
              className="w-full bg-[#ff000000]  px-[20px] py-[6.5px] text-right text-[13px] text-tm-black-80 outline-none   placeholder:font-normal placeholder:text-tm-black-20"
              type="number"
              placeholder="Value"
              step="0.01"
              {...(register
                ? register(`${milestone.value}`, {
                    required: isTableValuesRequired,
                  })
                : null)}
            />
            <span className="absolute right-[5px] top-[6px]">%</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentTranche;

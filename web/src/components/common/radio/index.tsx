import classNames from "classnames";

interface IRadioBoxState {
  radioBoxName: string;
  checked: boolean;
}

interface ICheckBoxProps {
  classes?: string;
  id: string;
  register?: any;
  radioBoxName: string;
  label?: string;
  containerClasses?: string;
  labelClasses?: string;
  radioBoxValue: boolean | undefined | string;
  setChecked: ({
    radioBoxName,
    checked,
  }: IRadioBoxState) => void | React.Dispatch<React.SetStateAction<IRadioBoxState>>;
}

export function RadioBox({
  classes,
  id,
  register,
  radioBoxName,
  label,
  labelClasses,
  setChecked,
  containerClasses,
  radioBoxValue,
}: ICheckBoxProps) {
  return (
    <div className={classNames(containerClasses, "inline-flex items-center gap-[6px]")}>
      <label className="relative flex cursor-pointer items-center rounded-full" htmlFor={id} data-ripple-dark="true">
        <input
          id={id}
          name={radioBoxName}
          type="radio"
          {...(register ? { ...register } : null)}
          value={radioBoxValue}
          onChange={(e) => {
            setChecked({ radioBoxName: e.target.id, checked: e.target.checked });
          }}
          className={classNames(
            classes,
            "before:content[''] text-pink-500 bg-transparent peer relative h-5 w-5 cursor-pointer appearance-none rounded-full  border border-tm-gray-light transition-all before:absolute before:left-2/4 before:top-2/4 before:block  before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-full before:bg-tm-black-80 before:opacity-0 before:transition-opacity checked:border-tm-black-80 checked:bg-tm-white  hover:before:opacity-10",
          )}
        />
        <div className="pointer-events-none absolute left-2/4 top-2/4 -translate-x-2/4 -translate-y-2/4 text-tm-black-80  opacity-0 transition-opacity peer-checked:opacity-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[10px] w-[10px]" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="8" r="8" />
          </svg>
        </div>
      </label>
      {label ? <span className={classNames(labelClasses, "text-brand-body leading-[1.2em]")}>{label}</span> : null}
    </div>
  );
}

import classNames from "classnames";

interface ICheckBoxProps {
  classes?: string;
  id: string;
  checkBoxName: string;
  label?: string;
  containerClasses?: string;
  labelClasses?: string;
  checkBoxValue: boolean | undefined;
  setChecked: (value: boolean) => void;
}

export function CheckBox({
  classes,
  id,
  checkBoxName,
  label,
  labelClasses,
  setChecked,
  containerClasses,
  checkBoxValue,
}: ICheckBoxProps) {
  return (
    <div className={classNames(containerClasses, "inline-flex items-center gap-[6px]")}>
      <label
        className="relative flex cursor-pointer items-center gap-[6px] rounded-full"
        htmlFor={id}
        data-ripple-dark="true"
      >
        <input
          type="checkbox"
          name={checkBoxName}
          className={classNames(
            classes,
            "before:content[''] before:bg-blue-gray-500 border-black bg-transparent peer relative h-[16px] w-[16px] cursor-pointer appearance-none rounded-[4px] border border-opacity-50 transition-all before:absolute before:left-2/4 before:top-2/4  before:block before:-translate-x-2/4 before:-translate-y-2/4 before:rounded-full before:opacity-0 before:transition-opacity checked:border-tm-black-80 checked:bg-tm-black-80 checked:before:bg-tm-black-80 hover:before:opacity-10",
          )}
          id={id}
          checked={checkBoxValue}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <div className="text-white pointer-events-none absolute left-1/2 top-1/2 size-[16px] -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity peer-checked:opacity-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="flex  h-full w-full items-center justify-center"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1%"
          >
            {/* <path
              fillRule='evenodd'
              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
              clipRule='evenodd'
            /> */}
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="#ffffff"></path>
          </svg>
        </div>
        {label ? <span className={classNames(labelClasses, "text-brand-body leading-[1.2em]")}>{label}</span> : null}
      </label>
    </div>
  );
}

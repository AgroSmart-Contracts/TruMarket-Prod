import { Switch } from "@headlessui/react";
import { useState } from "react";

export default function Switcher({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) {
  return (
    <Switch
      defaultChecked={enabled}
      onChange={onChange}
      className="data-[focus]:outline-white group relative flex h-7 w-14 cursor-pointer rounded-full bg-tm-black-80 p-1  opacity-20 transition-colors duration-200 ease-in-out focus:outline-none data-[checked]:bg-tm-green data-[checked]:opacity-100 data-[focus]:outline-1"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none inline-block size-5 translate-x-0 rounded-full bg-tm-white shadow-lg ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-7"
      />
    </Switch>
  );
}

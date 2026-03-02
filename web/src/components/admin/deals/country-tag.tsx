import { Chip } from "@mui/material";
import React from "react";
import Flag from "react-world-flags";
interface CountryTagProps {
  countryCode?: string;
  address: string;
}

const CountryTag: React.FC<CountryTagProps> = ({ countryCode, address }) => {
  return (
    <div>
      <Chip
        icon={
          <div className="h-[20px] w-[25px] object-contain">
            <Flag code={countryCode} />
          </div>
        }
        label={address}
      />
    </div>
  );
};

export default CountryTag;

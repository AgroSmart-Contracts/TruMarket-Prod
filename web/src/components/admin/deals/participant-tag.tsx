import { Chip } from "@mui/material";
import React from "react";

interface ParticipantTagProps {
  email: string;
  approved?: boolean;
}

const ParticipantTag: React.FC<ParticipantTagProps> = ({ email, approved }) => {
  return (
    <div className="mb-[10px] flex items-start gap-[5px]">
      <Chip
        label={
          <div className="flex gap-[10px]">
            <p>{email}</p>
            <p>
              <div className="h-[20px] w-[1px] bg-tm-black-20"></div>
            </p>
            <p>
              Status:{" "}
              {approved ? (
                <span className="text-tm-green">Aproved</span>
              ) : (
                <span className="text-tm-danger">Not Approved</span>
              )}
            </p>
          </div>
        }
      />
    </div>
  );
};

export default ParticipantTag;

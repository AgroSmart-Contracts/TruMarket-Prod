import { Chip } from "@mui/material";
import React from "react";

interface ParticipantTagProps {
  email: string;
}

const ParticipantTag: React.FC<ParticipantTagProps> = ({ email }) => {
  return (
    <div className="mb-[10px] flex items-start gap-[5px]">
      <Chip
        label={
          <div className="flex gap-[10px]">
            <p>{email}</p>
          </div>
        }
      />
    </div>
  );
};

export default ParticipantTag;

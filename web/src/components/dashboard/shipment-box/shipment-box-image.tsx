import Image from "next/image";
import React from "react";

interface ShipmentBoxImageProps {
  imageUrl?: string;
}

const ShipmentBoxImage: React.FC<ShipmentBoxImageProps> = ({ imageUrl }) => {
  return (
    <div>
      <div className="relative h-[166px] w-[163px]">
        <Image src={imageUrl ?? "/assets/no-image.png"} alt="image" objectFit="cover" className="rounded-[5px]" fill />
      </div>
    </div>
  );
};

export default ShipmentBoxImage;

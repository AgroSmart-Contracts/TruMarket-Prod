import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import Button from "src/components/common/button";
import Container from "src/components/common/container";

const guide = [
  {
    mainTitle: "plan the deal",
    title: "The buyer and the supplier gets in contact and agrees on the terms of their deal.",
    imageUrl: "/assets/test1.png",
  },
  {
    mainTitle: "Sign agreement online",
    title: "One of them creates an agreement in the platform and the other one accepts it.",
    imageUrl: "/assets/test2.png",
  },
  {
    mainTitle: "Smart contract",
    title: "The shipment is saved in the blockchain, so it is secure and transparent.",
    imageUrl: "/assets/test3.png",
  },
  {
    mainTitle: "Trace the shipment",
    title: "Now you can trace your shipment and exchange the documents in real-time.",
    imageUrl: "/assets/test4.png",
  },
];

function Welcome() {
  return (
    <Container>
      <div className="py-[55px]">
        <div className="mx-auto flex max-w-[500px] flex-col gap-[6px] text-center">
          <p className="text-tm-theme-text text-[15px]  font-bold leading-[1.2em] tracking-normal">
            Your account has been created
          </p>
          <p className="text-tm-theme-text text-[13px] font-normal leading-[1.2em] tracking-normal">
            We also assigned a blockchain wallet address to your account. <br /> You will be identified by it as the
            party of the process,
            <br /> to keep it secure and fully transparent.
          </p>
        </div>
        <div className="mx-auto mt-[30px] max-w-6xl rounded-[4px] border border-tm-black-20 bg-tm-white px-[60px] py-[30px]">
          <div>
            <h1 className="text-tm-theme-text pb-[30px]  text-center text-[26px] font-bold leading-[1.2em] tracking-normal">
              How it works
            </h1>
          </div>
          <div className="relative flex   items-center justify-center gap-[40px]">
            {guide.map((item, i) => (
              <div key={i} className="flex  flex-col items-center gap-[20px]">
                <div className="relative h-[140px] w-[140px]">
                  <Image
                    src={item.imageUrl}
                    fill
                    objectFit="cover"
                    className="rounded-[10px]"
                    loading="lazy"
                    alt={item.title}
                  />
                </div>
                <div>
                  <p className="mb-[10px] text-center text-[13px] font-bold uppercase leading-[1.2em] text-tm-black-80">
                    <span>{i + 1}.</span> {item.mainTitle}
                  </p>
                  <p className="max-w-[180px] text-center text-[13px] font-normal leading-[1.2em] text-tm-black-80 opacity-80">
                    {item.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-[10px] pt-[30px]">
          <div>
            <a href="/dashboard/create-shipment">
              <Button>
                <p className="text-[14px] font-bold leading-[1.2em] tracking-normal">Create an agreement</p>
              </Button>
            </a>
          </div>
          <div>
            <a href="/dashboard">
              <Button>
                <p className="text-[14px] font-bold leading-[1.2em] tracking-normal">Go to dashboard</p>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default Welcome;

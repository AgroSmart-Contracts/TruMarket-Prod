import Link from "next/link";
import React from "react";

import Button from "src/components/common/button";
import Container from "src/components/common/container";

interface Page404Props {}

const Page404: React.FC<Page404Props> = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="inline-block w-full">
        <Container>
          <div className="rounded-[4px] border border-tm-black-20 bg-tm-white py-[203px]">
            <div className="flex flex-col gap-[20px]">
              <p className="text-center text-[32px] font-bold leading-[1.2em] tracking-normal text-tm-black-80">
                This page doesn&apos;t exist
              </p>
              <div className="flex justify-center">
                <Link href="/">
                  <div>
                    <Button>
                      <p className="font-bold">Go to dashboard</p>
                    </Button>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Page404;

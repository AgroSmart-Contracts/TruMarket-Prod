import {
  Body,
  Button,
  Container,
  Font,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import * as React from 'react';

import { config } from '@/config';

export interface EmailProps {
  agreementId: string;
  actionTitle: string;
  descriptionText: string;
  buttonText: string;
  buttonHref: string;
}

export const Email = ({
  agreementId,
  actionTitle,
  descriptionText,
  buttonText,
  buttonHref,
}: EmailProps) => {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2',
            format: 'woff2',
          }}
          fontWeight={'bold, light, semibold'}
          fontStyle="normal"
        />
      </Head>
      <Preview>{actionTitle}</Preview>
      <Tailwind>
        <Body className="bg-[#2D3E57] my-auto mx-auto pt-[10px] pb-[40px] font-sans px-2 w-full overflow-x-hidden">
          <Section className="mt-[40px] mb-[24px]">
            <Img
              src="https://trumarket-dev-bucket.s3.eu-west-1.amazonaws.com/deals/665d75576326295608ec9629/1717491406500-logo.png"
              alt="Vercel"
              className="my-0 mx-auto"
            />
          </Section>
          <Container className="bg-white  rounded-tl-[4px] rounded-tr-[4px] py-[30px] mx-auto px-[40px] w-full">
            <Text className="text-center font-bold text-[15px] text-[#1F2D42] m-0">
              {actionTitle}
            </Text>
            <Text className="m-0 text-center opacity-80 text-[#2D3E57] text-[12px] leading-[1.2em] font-regular">
              Agreement identifier: #{agreementId}
            </Text>
            <Container className="px-[60px] m-0">
              <Text className="text-center opacity-80 text-[13px] mt-[10px] leading-[1.2em] tracking-0 font-regular">
                {descriptionText}
              </Text>
            </Container>
            <Container className="text-center">
              <Button
                target={'_blank'}
                href={buttonHref}
                className="bg-[#2D3E57] py-[10px] px-[20px] rounded-[4px] text-white font-bold text-[13px] leading-[1.3em]"
              >
                {buttonText}
              </Button>
            </Container>
          </Container>
          <Container className="bg-white rounded-bl-[4px] rounded-br-[4px] border">
            <Hr className="bg-[#2D3E57]" />
            <Container className="text-center pt-[10px] pb-[25px]">
              <Link
                target="_blank"
                href={`${config.appDomain}/dashboard/account-details`}
                className="text-[#1F2D42] opacity-60 underline text-center text-[11px] leading-[1.2em]"
              >
                Change notification settings
              </Link>
              <Text className="m-0 opacity-60 text-[#1F2D42] text-[11px] leading-[1.2em] mt-[6px]">
                If this email should not have been sent to you, you can ignore
                it.
              </Text>
            </Container>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

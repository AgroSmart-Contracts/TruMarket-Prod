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

export interface EmailRichProps {
  previewText: string;
  title: string;
  agreementId?: string;
  greeting: string;
  paragraphs: string[];
  detailTitle?: string;
  details: { label: string; value: string }[];
  buttonText: string;
  buttonHref: string;
}

export const EmailRich = ({
  previewText,
  title,
  agreementId,
  greeting,
  paragraphs,
  detailTitle,
  details,
  buttonText,
  buttonHref,
}: EmailRichProps) => {
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
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-[#2D3E57] my-auto mx-auto pt-[10px] pb-[40px] font-sans px-2 w-full overflow-x-hidden">
          <Section className="mt-[40px] mb-[24px]">
            <Img
              src={config.emailLogoUrl}
              alt="TruMarket"
              width={180}
              className="my-0 mx-auto h-auto max-w-[180px]"
            />
          </Section>
          <Container className="bg-white  rounded-tl-[4px] rounded-tr-[4px] py-[30px] mx-auto px-[40px] w-full">
            <Text className="text-center font-bold text-[15px] text-[#1F2D42] m-0">
              {title}
            </Text>
            {agreementId ? (
              <Text className="m-0 text-center opacity-80 text-[#2D3E57] text-[12px] leading-[1.2em] font-regular">
                Agreement identifier: #{agreementId}
              </Text>
            ) : null}
            <Container className="px-[40px] m-0">
              <Text className="text-left opacity-90 text-[#1F2D42] text-[13px] mt-[16px] mb-[8px] leading-[1.4em] font-regular">
                {greeting}
              </Text>
              {paragraphs.map((p, i) => (
                <Text
                  key={i}
                  className="text-left opacity-80 text-[#2D3E57] text-[13px] mt-[8px] leading-[1.45em] font-regular"
                >
                  {p}
                </Text>
              ))}
              {detailTitle && details.length > 0 ? (
                <>
                  <Text className="text-left font-semibold text-[#1F2D42] text-[13px] mt-[18px] mb-[8px]">
                    {detailTitle}
                  </Text>
                  {details.map((row, i) => (
                    <Text
                      key={i}
                      className="text-left opacity-85 text-[#2D3E57] text-[12px] mt-[4px] leading-[1.4em]"
                    >
                      <span className="font-semibold">{row.label}</span>
                      <span>{row.value}</span>
                    </Text>
                  ))}
                </>
              ) : null}
            </Container>
            <Container className="text-center mt-[18px]">
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
                If this email should not have been sent to you, you can ignore it.
              </Text>
              <Text className="m-0 opacity-70 text-[#1F2D42] text-[11px] leading-[1.2em] mt-[10px]">
                Thanks,
                <br />
                The TruMarket team
              </Text>
            </Container>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

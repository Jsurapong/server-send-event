import React, { useState } from "react";
import localFont from "next/font/local";
import { Input, Form } from "antd";
import { debounce } from "lodash";

import QRCode from "qrcode";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
interface SSEComponentProps {
  sseUrl: string;
}

const SSEComponent: React.FC<SSEComponentProps> = () => {
  const [text, setText] = useState("");
  const [base64, setBase64] = useState(null);

  // With async/await
  const generateQR = debounce(async (text: string) => {
    try {
      const res = await QRCode.toDataURL(text);
      setBase64(res);
    } catch (err) {
      console.error(err);
    }
  }, 1000);

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]`}
    >
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Form.Item label="Text">
          <Input
            onChange={(e) => {
              setText(e.target.value);
              generateQR(e.target.value);
            }}
          />
        </Form.Item>
        <Form.Item label="QR Code">
          {base64 && <img src={base64} width={200} height={200} />}
        </Form.Item>
      </main>
    </div>
  );
};

export default SSEComponent;

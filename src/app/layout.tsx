import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bean-wiki.vercel.app"),
  title: {
    default: "Bean Wiki — 열린 커피 백과사전",
    template: "%s | Bean Wiki",
  },
  description:
    "초심자부터 바리스타, 로스터, Q 그레이더까지 함께 만들고 배우는 열린 커피 백과사전.",
  openGraph: {
    title: "Bean Wiki — 열린 커피 백과사전",
    description: "씨앗에서 한 잔까지, 모든 커피 지식을 한곳에서.",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}

import DinoGame from "@/src/components/DinoGame";


export default function Home() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-white px-4 pb-24"
      style={{ fontFamily: "'Noto Sans', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-187.5">
        <DinoGame />

        <div className="mt-10 sm:pl-33.25">
          <h1 className="text-[28px] font-normal text-[#202124]">
            No Internet
          </h1>

          <p className="mt-5 text-[19px] text-[#5f6368]">Try:</p>

          <ul className="mt-3 list-disc pl-6 text-[19px] leading-9.25 text-[#5f6368]">
            <li>Checking the network cables, modem and router</li>
            <li>Reconnecting to Wi-Fi</li>
            <li>Running Windows Network Diagnostics</li>
          </ul>

          <p className="mt-5 font-mono text-[14px] uppercase text-[#5f6368]">
            ERR_INTERNET_DISCONNECTED
          </p>
        </div>
      </div>
    </main>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "$AIBOX — The Box That Feeds The Machine" },
      {
        name: "description",
        content:
          "$AIBOX — memecoin shrine for AI infrastructure. 0/0 tax, LP burned, 1B supply. Not affiliated with Dell.",
      },
      {
        property: "og:title",
        content: "$AIBOX — The Box That Feeds The Machine",
      },
      {
        property: "og:description",
        content: "The chip got the headline. The box runs the model.",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:image",
        content: "/aibox-logo.jpg",
      },
      {
        property: "og:url",
        content: "https://getaibox.xyz",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:image",
        content: "/aibox-logo.jpg",
      },
    ],
  }),
  component: Index,
});

const TERM_LINES = [
  "allocating gpu... done",
  "backlog detected: $95B",
  "compiling narrative.exe",
  "retail sentiment: euphoric",
  "roadmap.pdf not found",
  "chip demand > chip supply",
  "box status: feeding model",
  "holders: stacking silently",
  "narrative uptime: 99.9%",
  "dyor.exe refused to run",
];

const ASK_REPLIES = [
  "The box doesn't answer. The box ships.",
  "Utility is a state of mind.",
  "Ask again after the backlog clears. (It won't.)",
  "0/0 tax. 100/100 vibes.",
  "The chip got the headline. You got the chart.",
  "Roadmap? The rack has no map, only rows.",
  "Not financial advice. Barely advice at all.",
  "It's not a bubble, it's a box.",
  "Buy high, believe higher.",
  "The model trains. The chart doesn't.",
];

const CHAIN = "robinhood";
const CA_VALUE = "0x7b26047aEf3ebbfa9cdC38E064E4e7CF953710Ee";

const PONS_URL = [
  "https:",
  "",
  "www.ponsfamily.com",
  "launchpad",
  CA_VALUE,
].join("/");

const DEXSCREENER_URL =
  "https://dexscreener.com/search?q=" + CA_VALUE;

type HotToken = {
  name: string;
  symbol: string;
  icon?: string;
  change: number | null;
  url: string;
};

function Cursor() {
  return <span className="t-cursor" />;
}

function Terminal() {
  const [text, setText] = useState("");
  const idx = useRef(0);
  const char = useRef(0);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const tick = () => {
      const line = TERM_LINES[idx.current % TERM_LINES.length] ?? "";

      if (char.current < line.length) {
        char.current += 1;
        setText(line.slice(0, char.current));
        timeout = setTimeout(tick, 32);
      } else {
        idx.current += 1;
        char.current = 0;
        timeout = setTimeout(tick, 1400);
      }
    };

    tick();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="panel mb-[22px] text-left">
      <div className="panel-head">
        <span className="t-dot" />
        AIBOX // LIVE PROCESS
      </div>

      <div className="min-h-[38px] whitespace-pre-wrap font-mono text-[0.78rem] leading-relaxed text-neon">
        {text}
        <Cursor />
      </div>
    </div>
  );
}

function AskTheBox() {
  const [reply, setReply] = useState<string | null>(null);
  const [thinking, setThinking] = useState(0);

  const ask = () => {
    setReply(null);
    setThinking(1);

    let dots = 0;

    const iv = setInterval(() => {
      dots = (dots + 1) % 4;
      setThinking(dots + 1);
    }, 220);

    setTimeout(() => {
      clearInterval(iv);
      setThinking(0);

      setReply(
        ASK_REPLIES[
          Math.floor(Math.random() * ASK_REPLIES.length)
        ] ?? null,
      );
    }, 1100);
  };

  return (
    <div className="mb-10 w-full max-w-[460px]">
      <button
        onClick={ask}
        className="mb-[10px] w-full cursor-pointer rounded-xl border border-dashed border-led bg-surface p-[14px] font-mono text-[0.88rem] font-semibold text-led transition-colors hover:bg-surface-hover"
      >
        Ask the box ↴
      </button>

      <div className="min-h-5 px-1 text-left font-mono text-[0.82rem] text-foreground">
        {thinking > 0 && (
          <span className="text-dim">
            thinking{".".repeat(thinking - 1)}
          </span>
        )}

        {reply && (
          <>
            <span className="text-dim">&gt; </span>
            {reply}
          </>
        )}
      </div>
    </div>
  );
}

function HotTokens() {
  const [rows, setRows] = useState<HotToken[] | null>(null);
  const [failed, setFailed] = useState(false);

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  const [refreshing, setRefreshing] =
    useState(false);

  const previousRanks = useRef<
    Record<string, number>
  >({});

  const previousChanges = useRef<
    Record<string, number>
  >({});

  const [rankMovement, setRankMovement] =
    useState<
      Record<
        string,
        "up" | "down" | "same"
      >
    >({});

  const [priceMovement, setPriceMovement] =
    useState<
      Record<
        string,
        "up" | "down" | "same"
      >
    >({});

  /*
   * Menyimpan daftar token BOOSTED.
   *
   * Tidak perlu request boost API
   * setiap 5 detik.
   */
  const boostedAddresses =
    useRef<string[]>([]);

  /*
   * =====================================================
   * GET BOOSTED TOKENS
   * =====================================================
   */
  const loadBoostedTokens =
    async (): Promise<string[]> => {
      const [topResponse, latestResponse] =
        await Promise.all([
          fetch(
            "https://api.dexscreener.com/token-boosts/top/v1",
            {
              cache: "no-store",
            },
          ),

          fetch(
            "https://api.dexscreener.com/token-boosts/latest/v1",
            {
              cache: "no-store",
            },
          ),
        ]);

      if (
        !topResponse.ok ||
        !latestResponse.ok
      ) {
        throw new Error(
          "Boost API request failed",
        );
      }

      const top =
        await topResponse.json();

      const latest =
        await latestResponse.json();

      const combined = [
        ...(Array.isArray(top)
          ? top
          : []),

        ...(Array.isArray(latest)
          ? latest
          : []),
      ];

      /*
       * Hanya Robinhood Chain.
       *
       * toLowerCase() digunakan supaya
       * perbedaan kapitalisasi tidak
       * menyebabkan token hilang.
       */
      const seen =
        new Set<string>();

      const addresses: string[] = [];

      for (const token of combined) {
        const chainId =
          String(
            token?.chainId || "",
          ).toLowerCase();

        const address =
          String(
            token?.tokenAddress || "",
          );

        if (
          chainId ===
            CHAIN.toLowerCase() &&
          address &&
          !seen.has(
            address.toLowerCase(),
          )
        ) {
          seen.add(
            address.toLowerCase(),
          );

          addresses.push(address);
        }
      }

      /*
       * Maksimal 30 address
       * untuk request market.
       */
      return addresses.slice(0, 30);
    };

  /*
   * =====================================================
   * GET LIVE MARKET DATA
   * =====================================================
   */
  const loadMarketData =
    async (
      addresses: string[],
    ) => {
      if (
        addresses.length === 0
      ) {
        throw new Error(
          "No boosted tokens",
        );
      }

      /*
       * Endpoint resmi data token.
       *
       * Ini yang kita gunakan untuk
       * mendapatkan harga dan perubahan
       * 24 jam token boosted.
       */
      const response =
        await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${addresses.join(",")}`,
          {
            cache: "no-store",
          },
        );

      if (!response.ok) {
        throw new Error(
          "Market API request failed",
        );
      }

      const data =
        await response.json();

      /*
       * Untuk setiap token,
       * pilih pair dengan volume
       * 24H terbesar.
       */
      const byToken: Record<
        string,
        any
      > = {};

      for (const pair of
        data?.pairs || []) {
        if (
          String(
            pair?.chainId || "",
          ).toLowerCase() !==
          CHAIN.toLowerCase()
        ) {
          continue;
        }

        const address =
          String(
            pair?.baseToken
              ?.address || "",
          ).toLowerCase();

        if (!address) {
          continue;
        }

        const volume =
          Number(
            pair?.volume?.h24,
          ) || 0;

        if (
          !byToken[address] ||
          volume >
            (byToken[address]
              ._volume24h || 0)
        ) {
          byToken[address] = {
            ...pair,
            _volume24h:
              volume,
          };
        }
      }

      /*
       * Buat list berdasarkan
       * address boosted.
       *
       * Jadi token NON-BOOSTED
       * tidak akan masuk.
       */
      const list: HotToken[] =
        addresses
          .map(
            (address) =>
              byToken[
                address.toLowerCase()
              ],
          )
          .filter(Boolean)
          .map(
            (pair: any) => ({
              name:
                pair?.baseToken
                  ?.name ||
                "Unknown",

              symbol:
                pair?.baseToken
                  ?.symbol ||
                "",

              icon:
                pair?.info
                  ?.imageUrl ||
                undefined,

              change:
                typeof pair
                  ?.priceChange
                  ?.h24 ===
                "number"
                  ? pair
                      .priceChange
                      .h24
                  : null,

              url:
                pair?.url ||
                `https://dexscreener.com/${CHAIN}`,
            }),
          );

      /*
       * Ranking berdasarkan
       * performa 24H.
       */
      list.sort(
        (a, b) =>
          (b.change ?? -Infinity) -
          (a.change ?? -Infinity),
      );

      /*
       * Ambil 6 teratas.
       */
      return list.slice(0, 6);
    };

  /*
   * =====================================================
   * UPDATE DATA
   * =====================================================
   */
  const updateMarket =
    async () => {
      try {
        setRefreshing(true);

        /*
         * Kalau belum ada daftar boosted,
         * ambil terlebih dahulu.
         */
        if (
          boostedAddresses.current
            .length === 0
        ) {
          boostedAddresses.current =
            await loadBoostedTokens();
        }

        /*
         * Ambil harga terbaru.
         */
        const list =
          await loadMarketData(
            boostedAddresses.current,
          );

        if (
          list.length === 0
        ) {
          throw new Error(
            "No boosted market data",
          );
        }

        /*
         * =================================================
         * RANK MOVEMENT
         * =================================================
         */
        const newRanks: Record<
          string,
          number
        > = {};

        const newRankMovement: Record<
          string,
          "up" | "down" | "same"
        > = {};

        list.forEach(
          (token, index) => {
            const key =
              token.symbol;

            const newRank =
              index + 1;

            newRanks[key] =
              newRank;

            const oldRank =
              previousRanks.current[
                key
              ];

            if (
              oldRank ===
              undefined
            ) {
              newRankMovement[
                key
              ] = "same";
            } else if (
              newRank <
              oldRank
            ) {
              newRankMovement[
                key
              ] = "up";
            } else if (
              newRank >
              oldRank
            ) {
              newRankMovement[
                key
              ] = "down";
            } else {
              newRankMovement[
                key
              ] = "same";
            }
          },
        );

        previousRanks.current =
          newRanks;

        setRankMovement(
          newRankMovement,
        );

        /*
         * =================================================
         * PRICE MOVEMENT
         * =================================================
         */
        const newChanges: Record<
          string,
          number
        > = {};

        const newPriceMovement: Record<
          string,
          "up" | "down" | "same"
        > = {};

        list.forEach(
          (token) => {
            const key =
              token.symbol;

            const current =
              token.change ?? 0;

            newChanges[key] =
              current;

            const old =
              previousChanges.current[
                key
              ];

            if (
              old ===
              undefined
            ) {
              newPriceMovement[
                key
              ] = "same";
            } else if (
              current > old
            ) {
              newPriceMovement[
                key
              ] = "up";
            } else if (
              current < old
            ) {
              newPriceMovement[
                key
              ] = "down";
            } else {
              newPriceMovement[
                key
              ] = "same";
            }
          },
        );

        previousChanges.current =
          newChanges;

        setPriceMovement(
          newPriceMovement,
        );

        /*
         * Update UI.
         */
        setRows(list);

        setFailed(false);

        setLastUpdated(
          new Date(),
        );
      } catch (error) {
        console.error(
          "Hot Tokens:",
          error,
        );

        /*
         * Jangan menghapus data lama
         * kalau request berikutnya gagal.
         */
        if (
          !rows
        ) {
          setFailed(true);
        }
      } finally {
        setRefreshing(false);
      }
    };

  /*
   * =====================================================
   * INITIAL + AUTO REFRESH
   * =====================================================
   */
  useEffect(() => {
    let cancelled =
      false;

    /*
     * Initial request.
     */
    updateMarket();

    /*
     * Harga:
     * setiap 5 detik.
     */
    const marketInterval =
      setInterval(
        () => {
          if (!cancelled) {
            updateMarket();
          }
        },
        5000,
      );

    /*
     * Daftar BOOSTED:
     * setiap 30 detik.
     *
     * Kita tidak mengambil boost
     * API setiap 5 detik agar
     * tidak membuang rate limit.
     */
    const boostInterval =
      setInterval(
        async () => {
          if (cancelled) {
            return;
          }

          try {
            const addresses =
              await loadBoostedTokens();

            if (
              addresses.length > 0
            ) {
              boostedAddresses.current =
                addresses;

              await updateMarket();
            }
          } catch (error) {
            console.error(
              "Boost refresh:",
              error,
            );
          }
        },
        30000,
      );

    return () => {
      cancelled = true;

      clearInterval(
        marketInterval,
      );

      clearInterval(
        boostInterval,
      );
    };
  }, []);

  return (
    <div className="panel mb-10 text-left">
      {/* ========================================= */}
      {/* HEADER */}
      {/* ========================================= */}

      <div className="panel-head">
        <span
          className={`t-dot ${
            refreshing
              ? "animate-pulse"
              : ""
          }`}
        />

        ROBINHOOD CHAIN · BOOSTED

        <span
          className={`
            ml-auto
            font-mono
            text-[0.62rem]
            ${
              refreshing
                ? "animate-pulse text-led"
                : "text-led"
            }
          `}
        >
          ● LIVE
        </span>
      </div>

      {/* ========================================= */}
      {/* LIST */}
      {/* ========================================= */}

      <div className="flex flex-col">
        {!rows &&
          !failed && (
            <div className="py-4 text-center font-mono text-[0.78rem] text-dim">
              loading boosted tokens
              <Cursor />
            </div>
          )}

        {failed && (
          <div className="py-4 text-center text-[0.78rem] leading-relaxed text-dim">
            Unable to load boosted
            tokens right now.
            <br />
            Retrying automatically...
          </div>
        )}

        {rows?.map(
          (
            token,
            index,
          ) => {
            const key =
              token.symbol;

            const rank =
              rankMovement[
                key
              ] || "same";

            const price =
              priceMovement[
                key
              ] || "same";

            return (
              <a
                key={`${token.symbol}-${index}`}
                href={token.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  group
                  flex
                  items-center
                  gap-2.5
                  border-b
                  border-line
                  py-[10px]
                  transition-all
                  duration-500
                  last:border-b-0

                  ${
                    price ===
                    "up"
                      ? "bg-led/5"
                      : price ===
                          "down"
                        ? "bg-down/5"
                        : ""
                  }
                `}
              >
                {/* RANK */}

                <span
                  className={`
                    flex
                    w-7
                    shrink-0
                    items-center
                    gap-1
                    font-mono
                    text-[0.72rem]
                    transition-all
                    duration-500

                    ${
                      rank ===
                      "up"
                        ? "text-led"
                        : rank ===
                            "down"
                          ? "text-down"
                          : "text-dim"
                    }
                  `}
                >
                  {index + 1}

                  {rank ===
                    "up" && (
                    <span className="animate-bounce text-[0.62rem]">
                      ▲
                    </span>
                  )}

                  {rank ===
                    "down" && (
                    <span className="animate-bounce text-[0.62rem]">
                      ▼
                    </span>
                  )}
                </span>

                {/* ICON */}

                {token.icon ? (
                  <img
                    src={
                      token.icon
                    }
                    alt=""
                    loading="lazy"
                    className="
                      h-[22px]
                      w-[22px]
                      shrink-0
                      rounded-full
                      object-cover
                      transition-transform
                      duration-300
                      group-hover:scale-110
                    "
                  />
                ) : (
                  <div
                    className="
                      h-[22px]
                      w-[22px]
                      shrink-0
                      rounded-full
                      border
                      border-line
                      bg-surface
                    "
                  />
                )}

                {/* NAME */}

                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[0.9rem] font-medium">
                    {token.name}
                  </span>

                  <span className="mt-[1px] flex items-center gap-1.5 font-mono text-[0.62rem] text-dim">
                    {token.symbol}

                    <span className="rounded border border-led/40 px-1 text-[0.52rem] text-led">
                      BOOST
                    </span>
                  </span>
                </span>

                {/* PRICE CHANGE */}

                <span
                  className={`
                    flex
                    shrink-0
                    items-center
                    gap-1
                    font-mono
                    text-[0.78rem]
                    transition-all
                    duration-500

                    ${
                      token.change ===
                      null
                        ? "text-dim"
                        : token.change >=
                            0
                          ? "text-led"
                          : "text-down"
                    }
                  `}
                >
                  {price ===
                    "up" && (
                    <span className="animate-bounce text-[0.62rem]">
                      ▲
                    </span>
                  )}

                  {price ===
                    "down" && (
                    <span className="animate-bounce text-[0.62rem]">
                      ▼
                    </span>
                  )}

                  {token.change ===
                  null
                    ? "—"
                    : `${
                        token.change >=
                        0
                          ? "+"
                          : ""
                      }${token.change.toFixed(
                        1,
                      )}%`}
                </span>
              </a>
            );
          },
        )}
      </div>

      {/* ========================================= */}
      {/* DEXSCREENER */}
      {/* ========================================= */}

      <a
        href="https://dexscreener.com/robinhood"
        target="_blank"
        rel="noopener noreferrer"
        className="
          mt-3.5
          block
          rounded-[10px]
          border
          border-line
          bg-surface
          p-[11px]
          text-center
          font-mono
          text-[0.76rem]
          font-semibold
          text-led
          transition-colors
          hover:border-led
          hover:bg-surface-hover
        "
      >
        View all boosted tokens
      </a>

      {/* ========================================= */}
      {/* FOOTER */}
      {/* ========================================= */}

      <div className="mt-2.5 flex items-center justify-between gap-2 font-mono text-[0.62rem] text-dim opacity-70">
        <span>
          boosted tokens · live market
          data
        </span>

        <span className="shrink-0">
          {lastUpdated
            ? lastUpdated.toLocaleTimeString(
                [],
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                },
              )
            : "--:--:--"}
        </span>
      </div>
    </div>
  );
}
            
function Index() {
  const [copyLabel, setCopyLabel] = useState("Copy");

  const copy = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(CA_VALUE)
        .catch(() => {});
    }

    setCopyLabel(
      CA_VALUE === "coming soon" ? "Not live" : "Copied",
    );

    setTimeout(() => setCopyLabel("Copy"), 1300);
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-5 pb-10 pt-14 text-center">
      <div className="mb-10 w-full max-w-[520px] border-b border-line pb-3.5 font-mono text-[0.72rem] tracking-wide text-dim">
        AI DOESN'T LIVE IN SLIDES. IT LIVES IN A BOX.
      </div>

      {/* AIBOX LOGO
          Logo berada di /public/aibox-logo.jpg
          sehingga harus dipanggil menggunakan URL absolut:
          /aibox-logo.jpg
      */}
      <div className="relative mb-[26px] h-[132px] w-[132px] overflow-hidden rounded-full border-2 border-neon shadow-glow">
        <img
          src="/aibox-logo.jpg"
          alt="AIBOX logo"
          className="block h-full w-full object-cover"
          width={132}
          height={132}
        />
      </div>

      <div className="mb-5 rounded-full border border-neon px-4 py-1.5 font-mono text-[0.85rem] tracking-wide text-neon">
        $AIBOX
      </div>

      <h1 className="mb-[18px] max-w-[11ch] text-[clamp(2.1rem,9vw,3.2rem)] font-extrabold leading-[1.08] tracking-tight">
        The box that feeds the machine.
      </h1>

      <p className="mb-[30px] max-w-[36ch] text-[1.02rem] leading-relaxed text-dim">
        The chip got the headline. The box runs the model.
        Retail worships the backlog.
      </p>

      <div className="mb-[22px] flex w-full max-w-[460px] items-center justify-between gap-3 rounded-[14px] border border-line bg-surface px-[18px] py-3.5">
        <span className="flex-1 truncate text-left font-mono text-[0.82rem] text-dim">
          CA: {CA_VALUE}
        </span>

        <button
          onClick={copy}
          className="shrink-0 cursor-pointer rounded-lg bg-neon px-3.5 py-[9px] font-mono text-[0.78rem] font-semibold text-background"
        >
          {copyLabel}
        </button>
      </div>

      <div className="mb-11 flex w-full max-w-[460px] flex-wrap justify-center gap-3">
        <a
          href="#"
          className="min-w-[130px] flex-auto rounded-xl bg-neon px-[18px] py-[15px] text-[0.98rem] font-bold text-background shadow-glow"
        >
          Buy on Pons
        </a>

        <a
          href="https://dexscreener.com/robinhood"
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-[130px] flex-auto rounded-xl border border-line bg-surface px-[18px] py-[15px] text-[0.98rem] font-bold transition-colors hover:border-led hover:text-led"
        >
          Dexscreener
        </a>
      </div>

      <Terminal />

      <AskTheBox />

      <div className="mb-10 flex w-full max-w-[460px] overflow-hidden rounded-[14px] border border-line font-mono">
        {[
          ["0/0", "Tax"],
          ["Burned", "LP"],
          ["1B", "Supply"],
        ].map(([v, l]) => (
          <div
            key={l}
            className="flex-1 border-r border-line px-2 py-4 last:border-r-0"
          >
            <div className="text-[1.05rem] font-bold text-led">
              {v}
            </div>

            <div className="mt-1 text-[0.68rem] uppercase tracking-wide text-dim">
              {l}
            </div>
          </div>
        ))}
      </div>

      <HotTokens />

      <p className="mb-3.5 max-w-[440px] text-[0.95rem] leading-[1.75] text-dim">
        <b className="text-foreground">
          No utility. Just proof of a story.
        </b>

        <br />

        AI needs a brain, a brain needs power, power needs a rack.
        <br />

        Wall Street sold the news — the chain minted the box.
      </p>

      <p className="mb-10 font-mono text-[0.72rem] text-led opacity-85">
        fun fact: the real backlog behind this joke is $95B*
      </p>

      <div className="mb-11 flex gap-[22px] text-[0.92rem]">
        {[
          ["X", "https://x.com/AiboxCrypto"],
          ["Telegram", "https://t.me/aiboxcrypto"],
          ["Dexscreener", "https://dexscreener.com/robinhood"],
        ].map(([label, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-transparent pb-0.5 text-dim transition-colors hover:border-neon hover:text-neon"
          >
            {label}
          </a>
        ))}
      </div>

      <div className="mb-10 w-full max-w-[460px] rounded-[14px] border border-line bg-surface p-[18px] text-center">
        <div className="mb-2 font-mono text-[0.72rem] uppercase tracking-wide text-dim">
          Contact / Partnerships
        </div>

        <a
          href="mailto:join@getaibox.xyz"
          className="inline-block font-mono text-[0.95rem] font-semibold text-neon transition-colors hover:text-led"
        >
          join@getaibox.xyz
        </a>
      </div>

      <footer className="max-w-[420px] font-mono text-[0.7rem] leading-[1.7] text-dim">
        Built to celebrate Dell's record AI backlog quarter. A tribute,
        not a ticker.

        <span className="mt-2 block text-muted-foreground">
          $AIBOX is a memecoin — not Dell stock, not investment advice,
          not affiliated with Dell Technologies. High risk, zero
          guarantees.
        </span>

        <span className="mt-2 block text-muted-foreground">
          *Backlog figure from Dell's public Q2 FY27 filing. © 2026
          $AIBOX.
        </span>
      </footer>
    </main>
  );
  }

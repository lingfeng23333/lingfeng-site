import type { Metadata } from "next";
import CoverImage from "@/components/CoverImage";
import { getData, getIndex } from "@/lib/data";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = {
  title: "关于",
  description: "关于风起之地与凌风。",
};

export default function AboutPage() {
  const { user } = getData();
  const { lastSyncAt, subjects } = getIndex();
  const doing = subjects.filter((s) => s.collectionType === 3).length;
  const done = subjects.filter((s) => s.collectionType === 2).length;
  const wish = subjects.filter((s) => s.collectionType === 1).length;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="glass flex items-center gap-5 rounded-3xl p-6">
        <CoverImage
          src={user.avatar}
          alt={user.nickname}
          className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-accent-500/50"
        />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            {user.nickname}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {user.sign || "追番、写写感想。"}
          </p>
          <a
            href={user.url || "https://bgm.tv"}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-accent-600 hover:underline"
          >
            Bangumi 主页 ↗
          </a>
        </div>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          本站是干嘛的
        </h2>
        <p className="mt-3 text-sm leading-7 text-ink-700">
          一个普通到不能再普通的个人站：写博客、记追番、偶尔碎碎念。
          看番进度由 Bangumi 自动同步，每集感想用 Markdown 写在博客里，
          页面上的背景图和名言都是随机的。
        </p>
      </section>

      <section className="glass grid grid-cols-3 divide-x divide-white/10 rounded-2xl py-5 text-center">
        <div>
          <p className="text-2xl font-bold text-ink-900">{doing}</p>
          <p className="mt-1 text-xs text-ink-400">在看</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-ink-900">{done}</p>
          <p className="mt-1 text-xs text-ink-400">看过</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-ink-900">{wish}</p>
          <p className="mt-1 text-xs text-ink-400">想看</p>
        </div>
      </section>

      <p className="text-center text-xs text-ink-400">
        数据最后同步于 {formatDateTime(lastSyncAt)} · 由 Next.js 构建
      </p>
    </div>
  );
}

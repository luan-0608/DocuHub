import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/brand/Logo'
import { Marquee } from '@/components/brand/Marquee'
import { Reveal } from '@/components/brand/Reveal'
import { useAuthStore } from '@/features/auth/store'
import {
  ChatArt,
  FolderArt,
  IndexArt,
  SearchArt,
  ShieldArt,
  StepAskArt,
  StepSignupArt,
  StepUploadArt,
  UploadArt,
} from '@/components/brand/icons'

const FEATURES = [
  {
    art: UploadArt,
    title: 'Tải lên & lưu trữ',
    desc: 'Upload PDF, Word, PowerPoint. Hệ thống tự phân loại theo môn học, không còn thất lạc trong Drive hay Messenger.',
  },
  {
    art: SearchArt,
    title: 'Tìm kiếm tức thì',
    desc: 'Tìm theo tiêu đề, mô tả hoặc lọc theo môn học. Mọi tài liệu đều nằm trong tầm tay.',
  },
  {
    art: ChatArt,
    title: 'Hỏi đáp bằng AI',
    desc: 'Chatbot đọc hiểu nội dung tài liệu (RAG), trả lời trực tiếp dựa trên đúng những gì bạn đã tải lên.',
  },
  {
    art: FolderArt,
    title: 'Quản lý theo môn học',
    desc: 'Gắn nhãn, chỉnh sửa, xóa tài liệu bất cứ lúc nào. Toàn quyền kiểm soát dữ liệu học tập của bạn.',
  },
  {
    art: ShieldArt,
    title: 'Bảo mật theo tài khoản',
    desc: 'Xác thực JWT, mật khẩu mã hóa BCrypt. Chỉ bạn (và quản trị viên khi cần) mới truy cập được tài liệu.',
  },
  {
    art: IndexArt,
    title: 'Chỉ mục tự động',
    desc: 'Tài liệu được trích xuất và tạo embedding ngay sau khi tải lên, sẵn sàng cho AI trả lời trong vài giây.',
  },
]

const STEPS = [
  {
    n: '01',
    art: StepSignupArt,
    title: 'Đăng ký tài khoản',
    desc: 'Tạo tài khoản bằng email trong dưới một phút.',
  },
  {
    n: '02',
    art: StepUploadArt,
    title: 'Tải tài liệu lên',
    desc: 'Kéo thả file, gắn môn học, hệ thống tự lập chỉ mục.',
  },
  {
    n: '03',
    art: StepAskArt,
    title: 'Hỏi AI bất cứ điều gì',
    desc: 'Mở trợ lý AI, đặt câu hỏi, nhận câu trả lời từ chính tài liệu của bạn.',
  },
]

export default function HomePage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="min-h-svh bg-background">
      {/* Header dạng viên thuốc nổi: bo tròn hoàn toàn, nền mờ nhẹ, trôi trên màu loang của hero */}
      <header className="fixed inset-x-0 top-3 z-50 px-4 sm:top-5">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 rounded-full border border-primary/10 bg-card/90 pl-4 pr-2 shadow-wash-md backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <Logo />
            <span aria-hidden className="hidden size-2 shrink-0 rounded-full bg-wash-peach sm:block" />
            <nav className="hidden items-center sm:flex">
              <a
                href="#tinh-nang"
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-500 ease-in-out hover:bg-primary/10 hover:text-foreground"
              >
                Tính năng
              </a>
              <a
                href="#cach-dung"
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-500 ease-in-out hover:bg-primary/10 hover:text-foreground"
              >
                Cách dùng
              </a>
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {user ? (
              <Button size="sm" asChild>
                <Link to="/documents">Vào ứng dụng</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Đăng nhập</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Đăng ký</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero: màu loang đậm hơn phần còn lại — trang marketing được phép rực rỡ.
          pt lớn để chừa chỗ cho header nổi phía trên. */}
      <section className="relative overflow-hidden px-4 pb-14 pt-28 md:pb-24 md:pt-36">
        <div className="wc-blob blob-drift -left-24 -top-24 size-96 bg-wash-teal/40" />
        <div className="wc-blob blob-drift -right-20 top-10 size-80 bg-wash-peach/40 [animation-delay:-5s]" />
        <div className="wc-blob -bottom-32 left-1/3 size-96 bg-wash-rose/30" />
        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Một nơi lưu tài liệu học tập. Một <em className="italic text-primary">trợ lý AI</em>{' '}
              hiểu chúng.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              DocuHub tập trung toàn bộ tài liệu học tập của bạn vào một chỗ, và cho phép bạn hỏi
              trực tiếp AI dựa trên đúng nội dung đã tải lên.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Button size="lg" asChild>
                  <Link to="/documents">Mở kho tài liệu</Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" asChild>
                    <Link to="/register">Bắt đầu miễn phí</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/login">Tôi đã có tài khoản</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
          {/* Ảnh hero màu nước + nhãn nổi giữ lại từ bản minh họa SVG */}
          <div className="relative mx-auto w-full max-w-md">
            <img
              src="/hero-illustration.jpg"
              alt="Minh họa màu nước: sổ tay, tài liệu và bong bóng chat AI"
              className="aspect-square w-full rounded-3xl border border-primary/15 object-cover shadow-wash-lg"
            />
            <span className="absolute -top-3 right-6 rotate-2 rounded-full bg-wash-peach/80 px-3.5 py-1 text-xs font-semibold text-ink shadow-wash">
              Hỏi được bằng AI ✦
            </span>
          </div>
        </div>
      </section>

      <Marquee
        items={['PDF', 'DOCX', 'PPTX', 'TXT', 'Hỏi đáp AI', 'Tìm kiếm tức thì', 'Phân loại môn học', 'Lập chỉ mục tự động']}
      />

      <section id="tinh-nang" className="scroll-mt-24 px-4 py-14 md:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-primary md:text-4xl">
              Vì sao dùng DocuHub
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Thay thế Google Drive, Messenger và Facebook Group bằng một hệ thống quản lý tài liệu
              thực sự hiểu nội dung bạn đang lưu trữ.
            </p>
          </Reveal>

          <Reveal>
            <img
              src="/feature-banner.jpg"
              alt="Dải màu nước với các biểu tượng tài liệu, tìm kiếm, chat, thư mục"
              loading="lazy"
              className="mt-8 aspect-[2/1] w-full rounded-3xl border border-primary/10 object-cover shadow-wash sm:aspect-[3/1]"
            />
          </Reveal>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <div className="group h-full rounded-3xl border border-primary/15 bg-card p-6 shadow-wash transition-all duration-500 ease-in-out hover:border-primary/30 hover:shadow-wash-md">
                  <f.art className="tilt-on-hover size-14" />
                  <h3 className="mt-4 font-display text-lg font-bold text-primary">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="cach-dung" className="relative scroll-mt-24 overflow-hidden px-4 py-14 md:py-24">
        <div className="wc-blob -left-32 top-1/4 size-96 bg-wash-sand/30" />
        <div className="wc-blob -right-28 bottom-0 size-80 bg-wash-teal/30" />
        <div className="relative mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-primary md:text-4xl">
              Bắt đầu trong 3 bước
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_1.1fr] md:items-center">
            <div className="space-y-5">
              {STEPS.map((s, i) => (
                <Reveal key={s.n} delay={i * 120}>
                  <div className="group flex items-start gap-4 rounded-3xl border border-primary/15 bg-card p-5 shadow-wash transition-all duration-500 ease-in-out hover:shadow-wash-md">
                    <s.art className="tilt-on-hover size-14 shrink-0" />
                    <div>
                      <span className="text-xs italic text-muted-foreground">Bước {s.n}</span>
                      <h3 className="mt-1 font-display text-lg font-bold text-primary">{s.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <img
                src="/steps-illustration.jpg"
                alt="Minh họa 3 bước: đăng ký, tải tài liệu lên, hỏi AI"
                loading="lazy"
                className="aspect-square w-full rounded-3xl border border-primary/10 object-cover shadow-wash"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-4 py-14 md:py-24">
        <Reveal>
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-primary p-8 text-center text-primary-foreground shadow-bloom-soft md:p-12">
            {/* màu loang sáng trên nền xanh đậm cho cảm giác giấy ướt */}
            <div className="wc-blob -left-16 -top-16 size-64 bg-wash-teal/30" />
            <div className="wc-blob -bottom-20 -right-12 size-72 bg-wash-peach/25" />
            <span className="absolute right-6 top-5 rotate-2 rounded-full bg-wash-peach/80 px-3.5 py-1 text-xs font-semibold text-ink shadow-wash">
              Miễn phí ✦
            </span>
            <div className="relative">
              <h2 className="font-display text-2xl font-bold md:text-4xl">
                Ngừng tìm tài liệu cũ. Bắt đầu hỏi AI.
              </h2>
              <p className="mt-3 text-sm text-primary-foreground/85 md:text-base">
                {user
                  ? 'Tải tài liệu tiếp theo lên và hỏi AI ngay bây giờ.'
                  : 'Tạo tài khoản miễn phí, tải tài liệu đầu tiên lên trong vài phút.'}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-primary-foreground text-primary shadow-wash hover:bg-primary-foreground/90 hover:shadow-bloom"
                  asChild
                >
                  <Link to={user ? '/documents' : '/register'}>
                    {user ? 'Vào ứng dụng' : 'Đăng ký ngay'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-primary/10 px-4 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 text-xs italic text-muted-foreground">
          <span>DocuHub</span>
        </div>
      </footer>
    </div>
  )
}

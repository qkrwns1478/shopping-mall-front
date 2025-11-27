export default function Footer() {
  return (
    <footer className="py-12 bg-primary text-white">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <p className="m-0 text-center text-stone-300 text-sm font-light">
          Copyright &copy; 2025 MUNSIKSA. All rights reserved.
        </p>
        {/* <div className="mt-4 flex space-x-4">
          <a href="#" className="text-stone-400 hover:text-white transition-colors text-xs">Terms of Service</a>
          <span className="text-stone-600 text-xs">|</span>
          <a href="#" className="text-stone-400 hover:text-white transition-colors text-xs">Privacy Policy</a>
        </div> */}
        <p className="mt-6 text-center text-stone-500 text-xs px-4">
          MUNSIKSA는 포트폴리오 목적으로 제작된 쇼핑몰 사이트이며, <b>실제로 운영되는 서비스가 아닙니다</b>.
        </p>
      </div>
    </footer>
  );
}
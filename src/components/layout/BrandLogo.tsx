import logo from '../../assets/logo.svg';

export function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <img src={logo} alt="멈칫 로고" className="h-10 w-10" />
      <span className="text-[55px] font-semibold leading-none text-black">
        멈칫
      </span>
    </div>
  );
}

import logo from '../../assets/logo.svg';

export function BrandLogo() {
  return (
    <div className="flex items-center gap-1">
      <img src={logo} alt="멈칫 로고" className="h-12.5 w-12.25" />
      <span className="text-[29px] font-semibold leading-none text-black">
        멈칫
      </span>
    </div>
  );
}

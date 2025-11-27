// components/Header.tsx
export default function Header() {
  return (
    <header
      className="
        fixed top-0 left-0 right-0 h-16
        bg-[#2323ff] shadow-md
        flex items-center 
        px-7
        z-50
        gap-5
      "
    >
      {/* Substitua pela sua logo */}
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <h1 className="text-2xl font-semibold text-white">CONEXA</h1>
    </header>
  );
}

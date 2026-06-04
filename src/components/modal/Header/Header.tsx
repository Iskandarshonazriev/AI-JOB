import { useNavigate, Link, useLocation } from "react-router-dom";
import { Search, Sparkles, LogOut, Building2, User, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Navlist } from "../../shared/Navlist";
import { getUserRole } from "../role";

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getUserRole();

  // Читаем начальное значение поиска из URL-параметров (если оно там есть)
  const queryParams = new URLSearchParams(location.search);
  const [search, setSearch] = useState(queryParams.get("search") || "");

  // Логика перенаправления и фильтрации при изменении строки поиска
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (search.trim()) {
        // Если мы ищем вакансии будучи соискателем, отправляем на /jobs?search=...
        if (role === "jobseeker") {
          navigate(`/jobs?search=${encodeURIComponent(search)}`, { replace: location.pathname === "/jobs" });
        } else {
          // Если организация — отправляем на ее дашборд или страницу поиска кандидатов
          navigate(`/org/dashboard?search=${encodeURIComponent(search)}`, { replace: location.pathname === "/org/dashboard" });
        }
      } else if (search === "" && (location.pathname === "/jobs" || location.pathname === "/org/dashboard")) {
        // Если очистили поиск, находясь на странице результатов — убираем query-параметр
        navigate(location.pathname, { replace: true });
      }
    }, 400); // Небольшой дебаунс, чтобы не спамить роутер при каждом нажатии клавиши

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  // Синхронизируем инпут, если пользователь перешел на другую страницу или сбросил фильтр извне
  useEffect(() => {
    const currentSearch = new URLSearchParams(location.search).get("search") || "";
    if (currentSearch !== search) {
      setSearch(currentSearch);
    }
  }, [location.search]);

  const handleLogout = () => {
    localStorage.removeItem("store_token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md h-16 transition-all">
      <div className="max-w-[1400px] mx-auto px-6 h-full flex items-center justify-between gap-6">
        
        {/* Левая часть: Логотип и Поиск */}
        <div className="flex items-center gap-4 flex-1 max-w-lg">
          <Link 
            to={role === "organization" ? "/org/dashboard" : "/home"} 
            className="flex items-center gap-1.5 shrink-0 font-bold text-xl text-slate-900 tracking-tight hover:opacity-90 transition-opacity"
          >
            <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-indigo-600/20">
              A
            </div>
            <span>AIJob</span>
          </Link>
          
          {role === "organization" && (
            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none font-medium text-[11px] px-2.5 py-0.5 rounded-xl shrink-0 transition-colors">
              Business
            </Badge>
          )}
          
          <div className="relative w-full max-w-[320px] hidden md:block group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={role === "organization" ? "Search candidates..." : "Search jobs by title..."}
              className="pl-10 h-10 bg-slate-50 border-transparent rounded-xl text-sm font-medium focus-visible:bg-white focus-visible:border-slate-200 focus-visible:ring-4 focus-visible:ring-indigo-50/50 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Правая часть: Навигация и Профиль */}
        <div className="flex items-center h-full gap-5 shrink-0">
          <Navlist role={role} />
          
          <div className="hidden sm:block h-6 w-px bg-slate-100" />
          
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none group">
                <Avatar className="h-9 w-9 cursor-pointer rounded-xl border border-slate-200 bg-white transition-all group-hover:border-slate-300 group-hover:shadow-sm">
                  <AvatarFallback className={role === "organization" ? "bg-indigo-50 text-indigo-600" : "bg-slate-50 text-slate-600"}>
                    {role === "organization" ? <Building2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 mt-2 p-1.5 rounded-xl border-slate-200/80 shadow-xl shadow-slate-100/50 bg-white">
                {role === "organization" ? (
                  <DropdownMenuItem 
                    onClick={() => navigate("/orgprofile")}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
                  >
                    Company Profile
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    onClick={() => navigate("/profile")}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
                  >
                    My Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 focus:bg-rose-50 focus:text-rose-700 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {role === "jobseeker" && (
              <button
                onClick={() => navigate("/ai")}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 h-10 rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm shadow-slate-900/5"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-400 fill-indigo-400" />
                <span>AI Tools</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
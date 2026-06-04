import { Outlet } from "react-router-dom"
import { Header } from "../components/modal/Header/Header"

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <Header/>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout

import Navbar from "../components/Navbar";

function UserLayout({ children }) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1 container pb-5">
        {children}
      </main>
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <div className="container">
          <small>&copy; {new Date().getFullYear()} E-Commerce Microservices. Tất cả các quyền được bảo lưu.</small>
        </div>
      </footer>
    </div>
  );
}

export default UserLayout;

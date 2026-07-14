import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const DashboardHeader = ({ title, iconClass, badgeText }) => {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email") || "Nhân viên";

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar navbar-expand-lg navbar-dark shadow-sm mb-4 px-4 py-3 rounded-4" style={{ background: 'linear-gradient(135deg, #8C1D24 0%, #B22830 100%)' }}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <img
            src="https://www.highlandscoffee.com.vn/vnt_upload/weblink/red_BG_logo800.png"
            alt="Highlands Coffee"
            height="40"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <div className="vr text-white opacity-25" style={{ height: '30px' }}></div>
          <h4 className="text-white fw-bold mb-0 d-flex align-items-center gap-2">
            <i className={iconClass || "fa-solid fa-user-gear"}></i>
            {title}
            {badgeText && <span className="badge bg-white text-danger fs-6 rounded-pill ms-2">{badgeText}</span>}
          </h4>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="text-end text-white d-none d-sm-block">
            <small className="d-block opacity-75">Tài khoản đăng nhập</small>
            <span className="fw-semibold">{email}</span>
          </div>
          <div className="vr text-white opacity-25" style={{ height: '30px' }}></div>
          <button className="btn btn-light btn-sm rounded-pill px-3 py-2 fw-bold text-danger d-flex align-items-center gap-2 shadow-sm" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { fetchBanners, fetchVouchers } from "../../services/commerceService";
import { getSavedVoucherCodes, saveVoucherToWallet, showToast } from "../../services/shopConfigService";
import "./BrandPages.css";

function VoucherPage(){
 const [vouchers,setVouchers]=useState([]),[banners,setBanners]=useState([]),[saved,setSaved]=useState(getSavedVoucherCodes()),[filter,setFilter]=useState("ACTIVE");
 useEffect(()=>{fetchVouchers().then(r=>setVouchers(r.data));fetchBanners().then(r=>setBanners(r.data))},[]);
 const campaign=banners.find(b=>b.position==="PROMOTION")||banners[0];
 const shown=useMemo(()=>vouchers.filter(v=>filter!=="EXPIRING"||v.expiresAt&&new Date(v.expiresAt)-new Date()<7*86400000),[vouchers,filter]);
 const save=code=>{saveVoucherToWallet(code);setSaved(getSavedVoucherCodes());showToast("Đã lưu mã vào ví voucher")};
 return <UserLayout><div className="brand-page promotion-page">{campaign?.imageUrl&&<div className="full-width-page-banner"><img src={campaign.imageUrl} alt={campaign.title||"Banner khuyến mãi"}/></div>}<section id="voucher-list" className="brand-section voucher-section"><div className="section-heading-left"><div><span className="brand-kicker">VOUCHER WALLET</span><h2>Ưu đãi đang diễn ra</h2></div><Link to="/products">Chọn món ngay →</Link></div><div className="d-flex gap-2 mb-4"><button className={`btn ${filter==="ACTIVE"?"btn-danger":"btn-outline-danger"}`} onClick={()=>setFilter("ACTIVE")}>Còn hiệu lực</button><button className={`btn ${filter==="EXPIRING"?"btn-danger":"btn-outline-danger"}`} onClick={()=>setFilter("EXPIRING")}>Sắp hết hạn</button></div><div className="premium-voucher-grid">{shown.map(v=><article className="premium-voucher" key={v.id}><div className="voucher-value"><strong>{v.type==="PERCENT"?`${v.value}%`:`${Number(v.value/1000)}K`}</strong><span>GIẢM</span></div><div className="voucher-info"><span className="voucher-code">{v.code}</span><h3>{v.title}</h3><p>Đơn tối thiểu {Number(v.minOrder||0).toLocaleString("vi-VN")}đ · Còn {v.usageLimit==null?"không giới hạn":Math.max(0,v.usageLimit-(v.usedCount||0))} lượt</p><small>{v.expiresAt?`Hạn dùng ${new Date(v.expiresAt).toLocaleString("vi-VN")}`:"Không giới hạn thời gian"}</small></div><button disabled={saved.includes(v.code)} onClick={()=>save(v.code)}>{saved.includes(v.code)?"Đã lưu":"Lưu mã"}</button></article>)}</div></section></div></UserLayout>;
}
export default VoucherPage;

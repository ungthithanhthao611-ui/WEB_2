import { Link, useParams } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { getNewsById } from "../../services/contentService";

function NewsDetailPage() {
  const { id } = useParams();
  const article = getNewsById(id);
  return <UserLayout><div className="container py-5">
    {!article ? <div className="alert alert-warning text-center">Bài viết không tồn tại. <Link to="/news">Quay lại tin tức</Link></div> : <article className="mx-auto" style={{maxWidth:900}}>
      <Link to="/news" className="text-decoration-none text-danger fw-semibold"><i className="fa-solid fa-arrow-left me-2"></i>Quay lại tin tức</Link>
      <header className="text-center my-4"><small className="text-danger fw-bold">{new Date(article.createdAt).toLocaleDateString("vi-VN")}</small><h1 className="display-5 fw-bold mt-2">{article.title}</h1><p className="lead text-muted">{article.summary}</p></header>
      {article.imageUrl && <img src={article.imageUrl} alt={article.title} className="w-100 rounded-4 shadow-sm mb-4" style={{maxHeight:520,objectFit:"cover"}}/>}
      <div className="fs-5 lh-lg" style={{whiteSpace:"pre-wrap"}}>{article.content}</div>
    </article>}
  </div></UserLayout>;
}
export default NewsDetailPage;

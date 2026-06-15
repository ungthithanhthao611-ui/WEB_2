import { Link } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { getNews } from "../../services/contentService";

function NewsPage() {
  const articles = getNews();
  return <UserLayout><div className="container py-5"><div className="text-center mb-5"><span className="brand-kicker">HIGHLANDS STORIES</span><h2 className="fw-bold mt-2">Tin Tức Highlands</h2></div><div className="row g-4">
    {articles.map((article) => <article className="col-md-6 col-lg-4" key={article.id}><div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">{article.imageUrl && <img src={article.imageUrl} alt={article.title} style={{height:240, objectFit:"cover"}}/>}<div className="card-body d-flex flex-column p-4"><small className="text-danger fw-bold mb-2">{new Date(article.createdAt).toLocaleDateString("vi-VN")}</small><h4>{article.title}</h4><p className="text-muted flex-grow-1">{article.summary}</p><Link className="btn btn-outline-danger rounded-pill align-self-start" to={`/news/${article.id}`}>Xem chi tiết</Link></div></div></article>)}
    {!articles.length && <div className="alert alert-info">Chưa có bài viết mới.</div>}
  </div></div></UserLayout>;
}
export default NewsPage;

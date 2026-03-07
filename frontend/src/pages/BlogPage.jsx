// src/pages/BlogPage.jsx
import React, { useState, useMemo } from 'react';
import { posts, categories } from '../data/blogData';
import BlogPostPage from './BlogPostPage';

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPost, setSelectedPost] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return posts.filter(p => {
      const matchCat  = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch = search === '' ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [activeCategory, search]);

  const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const getCat     = (id) => categories.find(c => c.id === id);

  if (selectedPost) return <BlogPostPage post={selectedPost} onBack={() => setSelectedPost(null)} />;

  const [featured, ...rest] = filtered;

  return (
    <div style={wrap}>
      {/* Hero */}
      <div style={hero}>
        <div style={heroInner}>
          <div style={badge}>✦ Blog AgendAI</div>
          <h1 style={heroTitle}>Conteúdo para quem<br/>vive do próprio talento</h1>
          <p style={heroSub}>Dicas de negócio, produtividade e tendências para profissionais autônomos.</p>
          <div style={searchWrap}>
            <span style={searchIcon}>🔍</span>
            <input
              style={searchInput}
              placeholder="Buscar artigos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div style={container}>
        {/* Categorias */}
        <div style={catRow}>
          <button onClick={() => setActiveCategory('all')} style={catBtn(activeCategory === 'all', '#7c6af7')}>
            Todos
          </button>
          {categories.map(c => (
            <button key={c.id} onClick={() => setActiveCategory(c.id)} style={catBtn(activeCategory === c.id, c.color)}>
              {c.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:'80px 0', color:'#6b6b80' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <p>Nenhum artigo encontrado.</p>
          </div>
        )}

        {/* Post em destaque */}
        {featured && (
          <div onClick={() => setSelectedPost(featured)} style={featuredCard}>
            <div style={{ ...featuredImg, backgroundImage:`url(${featured.image})` }}>
              <div style={featuredOverlay}/>
              <div style={featuredContent}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <span style={tagStyle(getCat(featured.category)?.color)}>
                    {getCat(featured.category)?.label}
                  </span>
                  <span style={metaText}>⏱ {featured.readTime}</span>
                </div>
                <h2 style={featuredTitle}>{featured.title}</h2>
                <p style={featuredExcerpt}>{featured.excerpt}</p>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:16 }}>
                  <span style={metaText}>{formatDate(featured.date)}</span>
                  <span style={readMore}>Ler artigo →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grid de posts */}
        {rest.length > 0 && (
          <div style={grid}>
            {rest.map(post => (
              <div key={post.id} onClick={() => setSelectedPost(post)} style={postCard}>
                <div style={{ ...postImg, backgroundImage:`url(${post.image})` }}/>
                <div style={postBody}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                    <span style={tagStyle(getCat(post.category)?.color)}>
                      {getCat(post.category)?.label}
                    </span>
                    <span style={metaText}>⏱ {post.readTime}</span>
                  </div>
                  <h3 style={postTitle}>{post.title}</h3>
                  <p style={postExcerpt}>{post.excerpt}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14 }}>
                    <span style={metaText}>{formatDate(post.date)}</span>
                    <span style={readMore}>Ler →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div style={ctaBox}>
          <div style={{ fontSize:36, marginBottom:12 }}>📅</div>
          <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:22, fontWeight:800, marginBottom:8 }}>
            Pronto para organizar sua agenda?
          </h3>
          <p style={{ color:'#8b8ba0', fontSize:14, marginBottom:20 }}>
            Crie sua conta grátis e comece a receber agendamentos online hoje mesmo.
          </p>
          <a href="/register" style={ctaBtn}>Criar conta grátis →</a>
        </div>
      </div>

      <footer style={foot}>
        <span style={{ color:'#444460', fontSize:12 }}>© 2026 AgendAI · Todos os direitos reservados</span>
      </footer>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────────
const wrap      = { minHeight:'100vh', background:'#080810', color:'#e8e8f0', fontFamily:"'DM Sans', sans-serif" };
const hero      = { background:'linear-gradient(160deg, #0d0d1a 0%, #13131a 60%, #0d0d1a 100%)', borderBottom:'1px solid #1a1a2e', padding:'72px 24px 56px' };
const heroInner = { maxWidth:680, margin:'0 auto', textAlign:'center' };
const badge     = { display:'inline-block', padding:'4px 14px', borderRadius:20, background:'rgba(124,106,247,.15)', border:'1px solid rgba(124,106,247,.3)', color:'#7c6af7', fontSize:12, fontWeight:600, letterSpacing:1, marginBottom:20 };
const heroTitle = { fontFamily:'Syne, sans-serif', fontSize:'clamp(28px, 5vw, 48px)', fontWeight:800, lineHeight:1.15, marginBottom:16, background:'linear-gradient(135deg, #e8e8f0 30%, #7c6af7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' };
const heroSub   = { color:'#8b8ba0', fontSize:16, lineHeight:1.7, marginBottom:28 };
const searchWrap  = { position:'relative', maxWidth:400, margin:'0 auto' };
const searchIcon  = { position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:14 };
const searchInput = { width:'100%', padding:'12px 14px 12px 40px', background:'rgba(255,255,255,.05)', border:'1px solid rgba(255,255,255,.1)', borderRadius:12, color:'#e8e8f0', fontSize:14, outline:'none', fontFamily:"'DM Sans', sans-serif", boxSizing:'border-box' };
const container = { maxWidth:1100, margin:'0 auto', padding:'40px 24px' };
const catRow    = { display:'flex', flexWrap:'wrap', gap:8, marginBottom:36 };
const catBtn    = (active, color) => ({ padding:'6px 16px', borderRadius:20, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${active ? color : 'rgba(255,255,255,.1)'}`, background: active ? `${color}22` : 'transparent', color: active ? color : '#8b8ba0', transition:'all .15s', fontFamily:"'DM Sans', sans-serif" });
const tagStyle  = (color) => ({ display:'inline-block', padding:'2px 10px', borderRadius:10, fontSize:11, fontWeight:600, background:`${color}22`, color, border:`1px solid ${color}44` });
const metaText  = { fontSize:11, color:'#555570' };
const readMore  = { fontSize:12, color:'#7c6af7', fontWeight:600, cursor:'pointer' };

const featuredCard    = { borderRadius:20, overflow:'hidden', marginBottom:32, cursor:'pointer', border:'1px solid #1a1a2e', transition:'transform .2s', ':hover':{ transform:'scale(1.01)' } };
const featuredImg     = { height:420, backgroundSize:'cover', backgroundPosition:'center', position:'relative', display:'flex', alignItems:'flex-end' };
const featuredOverlay = { position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,8,16,.95) 0%, rgba(8,8,16,.3) 60%, transparent 100%)' };
const featuredContent = { position:'relative', zIndex:1, padding:'32px' };
const featuredTitle   = { fontFamily:'Syne, sans-serif', fontSize:'clamp(20px, 3vw, 32px)', fontWeight:800, lineHeight:1.25, marginBottom:10, color:'#e8e8f0' };
const featuredExcerpt = { color:'#a0a0b8', fontSize:15, lineHeight:1.7, maxWidth:600 };

const grid      = { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:20, marginBottom:40 };
const postCard  = { background:'#0d0d1a', border:'1px solid #1a1a2e', borderRadius:16, overflow:'hidden', cursor:'pointer', transition:'border-color .2s, transform .2s' };
const postImg   = { height:180, backgroundSize:'cover', backgroundPosition:'center' };
const postBody  = { padding:'20px' };
const postTitle = { fontFamily:'Syne, sans-serif', fontSize:16, fontWeight:700, lineHeight:1.35, marginBottom:8, color:'#e8e8f0' };
const postExcerpt = { fontSize:13, color:'#6b6b80', lineHeight:1.6 };

const ctaBox = { background:'linear-gradient(135deg, rgba(124,106,247,.1), rgba(79,209,197,.05))', border:'1px solid rgba(124,106,247,.2)', borderRadius:20, padding:'40px 24px', textAlign:'center', marginTop:16 };
const ctaBtn = { display:'inline-block', padding:'12px 28px', background:'linear-gradient(135deg, #7c6af7, #4fd1c5)', borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, textDecoration:'none', fontFamily:"'DM Sans', sans-serif" };
const foot   = { borderTop:'1px solid #1a1a2e', padding:'24px', textAlign:'center' };

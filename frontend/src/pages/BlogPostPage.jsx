// src/pages/BlogPostPage.jsx
import React, { useEffect } from 'react';
import { categories } from '../data/blogData';

export default function BlogPostPage({ post, onBack }) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const cat       = categories.find(c => c.id === post.category);
  const formatDate = (d) => new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });

  // Renderiza markdown simples: **bold**, parágrafos, títulos ##
  const renderContent = (text) => {
    return text.split('\n\n').map((block, i) => {
      if (block.startsWith('**') && block.endsWith('**') && !block.slice(2,-2).includes('**')) {
        return <h3 key={i} style={h3Style}>{block.slice(2,-2)}</h3>;
      }
      // inline bold
      const parts = block.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} style={pStyle}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div style={wrap}>
      {/* Hero com imagem */}
      <div style={{ ...heroImg, backgroundImage:`url(${post.image})` }}>
        <div style={overlay}/>
        <div style={heroContent}>
          <button onClick={onBack} style={backBtn}>← Voltar ao Blog</button>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <span style={tagStyle(cat?.color)}>{cat?.label}</span>
            <span style={meta}>⏱ {post.readTime}</span>
            <span style={meta}>{formatDate(post.date)}</span>
          </div>
          <h1 style={titleStyle}>{post.title}</h1>
          <p style={excerptStyle}>{post.excerpt}</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={container}>
        <article style={article}>
          {renderContent(post.content)}
        </article>

        {/* Divider */}
        <div style={{ borderTop:'1px solid #1a1a2e', margin:'40px 0' }}/>

        {/* CTA */}
        <div style={ctaBox}>
          <div style={{ fontSize:32, marginBottom:10 }}>📅</div>
          <h3 style={{ fontFamily:'Syne, sans-serif', fontSize:20, fontWeight:800, marginBottom:8 }}>
            Gostou do conteúdo?
          </h3>
          <p style={{ color:'#8b8ba0', fontSize:14, marginBottom:20 }}>
            O AgendAI ajuda profissionais como você a organizarem a agenda e faturarem mais.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <a href="/register" style={btnPrimary}>Criar conta grátis →</a>
            <button onClick={onBack} style={btnSecondary}>Ver mais artigos</button>
          </div>
        </div>
      </div>

      <footer style={foot}>
        <span style={{ color:'#444460', fontSize:12 }}>© 2026 AgendAI · Todos os direitos reservados</span>
      </footer>
    </div>
  );
}

const wrap        = { minHeight:'100vh', background:'#080810', color:'#e8e8f0', fontFamily:"'DM Sans', sans-serif" };
const heroImg     = { minHeight:420, backgroundSize:'cover', backgroundPosition:'center', position:'relative', display:'flex', alignItems:'flex-end' };
const overlay     = { position:'absolute', inset:0, background:'linear-gradient(to top, rgba(8,8,16,1) 0%, rgba(8,8,16,.5) 50%, rgba(8,8,16,.2) 100%)' };
const heroContent = { position:'relative', zIndex:1, maxWidth:760, margin:'0 auto', width:'100%', padding:'40px 24px' };
const backBtn     = { background:'none', border:'none', color:'#7c6af7', cursor:'pointer', fontSize:13, fontWeight:600, padding:'0 0 20px', display:'block', fontFamily:"'DM Sans', sans-serif" };
const tagStyle    = (color) => ({ display:'inline-block', padding:'3px 12px', borderRadius:10, fontSize:11, fontWeight:600, background:`${color}22`, color, border:`1px solid ${color}44` });
const meta        = { fontSize:11, color:'#555570' };
const titleStyle  = { fontFamily:'Syne, sans-serif', fontSize:'clamp(22px, 4vw, 40px)', fontWeight:800, lineHeight:1.2, marginBottom:14, color:'#e8e8f0' };
const excerptStyle = { color:'#a0a0b8', fontSize:16, lineHeight:1.7 };

const container = { maxWidth:760, margin:'0 auto', padding:'48px 24px' };
const article   = { marginBottom:40 };
const h3Style   = { fontFamily:'Syne, sans-serif', fontSize:18, fontWeight:700, color:'#e8e8f0', margin:'28px 0 10px', borderLeft:'3px solid #7c6af7', paddingLeft:12 };
const pStyle    = { fontSize:15, color:'#a0a0b8', lineHeight:1.85, marginBottom:16 };

const ctaBox      = { background:'linear-gradient(135deg, rgba(124,106,247,.1), rgba(79,209,197,.05))', border:'1px solid rgba(124,106,247,.2)', borderRadius:20, padding:'36px 24px', textAlign:'center' };
const btnPrimary  = { display:'inline-block', padding:'11px 24px', background:'linear-gradient(135deg, #7c6af7, #4fd1c5)', borderRadius:10, color:'#fff', fontWeight:700, fontSize:14, textDecoration:'none', fontFamily:"'DM Sans', sans-serif", cursor:'pointer', border:'none' };
const btnSecondary = { padding:'11px 24px', background:'transparent', border:'1px solid #2a2a3a', borderRadius:10, color:'#e8e8f0', fontWeight:600, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" };
const foot        = { borderTop:'1px solid #1a1a2e', padding:'24px', textAlign:'center' };

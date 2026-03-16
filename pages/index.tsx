import {useEffect,useState} from 'react';
import {useRouter} from 'next/router';
import {supabase} from '../lib/supabase';
export default function Home(){
  const router=useRouter();
  const [loading,setLoading]=useState(true);
  useEffect(()=>{const checkAuth=async()=>{const {data}=await supabase.auth.getSession();if(data?.session)router.push('/dashboard');setLoading(false);};checkAuth();},[router]);
  if(loading) return null;
  return (
    <div style={{background:'#fff',color:'#1a1a1a',fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
      {/* Navigation */}
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid #f0f0f0'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,letterSpacing:'-0.5px',margin:0}}>DueMate</h1>
        <div style={{display:'flex',gap:'16px',alignItems:'center'}}>
          <button onClick={()=>router.push('/pricing')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'14px',color:'#666',display:'none'}} className='hide-mobile'>Pricing</button>
          <button onClick={()=>router.push('/auth')} style={{background:'#1a1a1a',color:'white',padding:'10px 16px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:600}}>Sign In</button>
        </div>
      </nav>
      {/* Hero */}
      <section style={{padding:'40px 20px',maxWidth:'1200px',margin:'0 auto'}}>
        <div style={{maxWidth:'600px'}}>
          <h2 style={{fontSize:'32px',fontWeight:700,lineHeight:1.2,marginBottom:'16px',letterSpacing:'-1px'}}>Stop chasing late payments</h2>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.6,marginBottom:'24px'}}>DueMate helps freelancers track overdue invoices, send automated reminders, and get paid on time. No more spreadsheets. No more guessing.</p>
          <button onClick={()=>router.push('/auth')} style={{background:'#1a1a1a',color:'white',padding:'14px 28px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'16px',fontWeight:600}}>Start Free Trial</button>
        </div>
      </section>
      {/* Stats */}
      <section style={{background:'#f8f8f8',padding:'40px 20px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))',gap:'24px'}}>
          <div><div style={{fontSize:'36px',fontWeight:700,color:'#1a1a1a',marginBottom:'8px'}}>85%</div><p style={{fontSize:'14px',color:'#666',margin:0}}>of freelancers receive late payments</p></div>
          <div><div style={{fontSize:'36px',fontWeight:700,color:'#1a1a1a',marginBottom:'8px'}}>$5k+</div><p style={{fontSize:'14px',color:'#666',margin:0}}>average unpaid invoices per year</p></div>
          <div><div style={{fontSize:'36px',fontWeight:700,color:'#1a1a1a',marginBottom:'8px'}}>30%</div><p style={{fontSize:'14px',color:'#666',margin:0}}>of invoices paid late</p></div>
        </div>
      </section>
      {/* Features */}
      <section style={{padding:'40px 20px'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <h3 style={{fontSize:'28px',fontWeight:700,marginBottom:'32px',textAlign:'center'}}>Everything you need</h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:'24px'}}>
            {[
              {icon:'📊',title:'Invoice Tracking',desc:'Monitor all invoices in one place. Know exactly which ones are overdue.'},
              {icon:'🔔',title:'Smart Reminders',desc:'Send automated payment reminders to clients with one click.'},
              {icon:'📈',title:'Analytics',desc:'See payment trends, average collection time, and late payment rates.'}
            ].map((f,i)=>(
              <div key={i} style={{padding:'24px',background:'#f8f8f8',borderRadius:'12px'}}>
                <div style={{fontSize:'32px',marginBottom:'12px'}}>{f.icon}</div>
                <h4 style={{fontSize:'18px',fontWeight:700,marginBottom:'8px',margin:0}}>{f.title}</h4>
                <p style={{fontSize:'14px',color:'#666',lineHeight:1.6,margin:0}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section style={{background:'#1a1a1a',color:'white',padding:'40px 20px',textAlign:'center'}}>
        <h3 style={{fontSize:'28px',fontWeight:700,marginBottom:'12px'}}>Ready to stop chasing payments?</h3>
        <p style={{fontSize:'16px',color:'#ccc',marginBottom:'24px'}}>Try DueMate free for 7 days. No credit card required.</p>
        <button onClick={()=>router.push('/auth')} style={{background:'white',color:'#1a1a1a',padding:'14px 28px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'16px',fontWeight:600}}>Start Free Trial</button>
      </section>
      {/* Footer */}
      <footer style={{borderTop:'1px solid #f0f0f0',padding:'32px 20px',textAlign:'center',color:'#666',fontSize:'12px'}}>
        <p style={{margin:0}}>© 2026 DueMate. All rights reserved.</p>
      </footer>
    </div>
  );
}

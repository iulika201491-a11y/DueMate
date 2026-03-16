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
          <button onClick={()=>router.push('/guide')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'14px',color:'#666'}}>Guide</button>
          <button onClick={()=>router.push('/pricing')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'14px',color:'#666'}}>Pricing</button>
          <button onClick={()=>router.push('/auth')} style={{background:'#1a1a1a',color:'white',padding:'10px 16px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:600}}>Sign In</button>
        </div>
      </nav>
      {/* Hero */}
      <section style={{padding:'40px 20px',maxWidth:'1200px',margin:'0 auto'}}>
        <div style={{maxWidth:'600px'}}>
          <h1 style={{fontSize:'32px',fontWeight:700,lineHeight:1.2,marginBottom:'16px',letterSpacing:'-1px'}}>Track Late Payments & Get Paid Faster</h1>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.6,marginBottom:'24px'}}>85% of freelancers struggle with late payments. DueMate automatically tracks overdue invoices, sends client reminders, and shows you which clients pay reliably.</p>
          <div style={{display:'flex',gap:'12px'}}>
            <button onClick={()=>router.push('/auth')} style={{background:'#1a1a1a',color:'white',padding:'14px 28px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'16px',fontWeight:600}}>Stop Chasing Invoices</button>
            <button onClick={()=>router.push('/guide')} style={{background:'#f3f4f6',color:'#1a1a1a',padding:'14px 28px',borderRadius:'8px',border:'1px solid #d1d5db',cursor:'pointer',fontSize:'16px',fontWeight:600}}>See How It Works</button>
          </div>
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
          <h2 style={{fontSize:'28px',fontWeight:700,marginBottom:'32px',textAlign:'center'}}>Everything you need to get paid faster</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:'24px'}}>
            {[
              {icon:'📊',title:'Client Reliability Scores',desc:'See exactly which clients pay late. Make data-driven decisions about future work.'},
              {icon:'🔔',title:'Automated Payment Reminders',desc:'Reminders send automatically on day 3 & 7 after due date. No manual follow-ups needed.'},
              {icon:'💰',title:'Late Fee Calculator',desc:'Show clients exactly what they owe with late fees. Encourages faster payment.'}
            ].map((f,i)=>(
              <div key={i} style={{padding:'24px',background:'#f8f8f8',borderRadius:'12px'}}>
                <div style={{fontSize:'32px',marginBottom:'12px'}}>{f.icon}</div>
                <h3 style={{fontSize:'18px',fontWeight:700,marginBottom:'8px',margin:0}}>{f.title}</h3>
                <p style={{fontSize:'14px',color:'#666',lineHeight:1.6,margin:0}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA */}
      <section style={{background:'#1a1a1a',color:'white',padding:'40px 20px',textAlign:'center'}}>
        <h2 style={{fontSize:'28px',fontWeight:700,marginBottom:'12px'}}>Stop chasing late payments today</h2>
        <p style={{fontSize:'16px',color:'#ccc',marginBottom:'24px'}}>Try DueMate free for 7 days. Get client reliability scores, automated reminders, and late fee tracking. No credit card required.</p>
        <button onClick={()=>router.push('/auth')} style={{background:'white',color:'#1a1a1a',padding:'14px 28px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'16px',fontWeight:600}}>Start Free Trial</button>
      </section>

      {/* FAQ */}
      <section style={{padding:'40px 20px'}}>
        <div style={{maxWidth:'800px',margin:'0 auto'}}>
          <h2 style={{fontSize:'28px',fontWeight:700,marginBottom:'32px',textAlign:'center'}}>Questions?</h2>
          {[
            {q:'How do I get paid faster?',a:'DueMate sends automated reminders on day 3 & 7 after due date. Most freelancers see 40% faster payments.'},
            {q:'What is client reliability scoring?',a:'We analyze your payment history with each client and show you a 0-100 score. Identifies which clients pay late so you can adjust terms upfront.'},
            {q:'Does it work with any client?',a:'Yes. Works with all clients regardless of platform. You control all data.'},
            {q:'Can I cancel anytime?',a:'Yes. Cancel subscription anytime with no penalties.'},
            {q:'Is my data secure?',a:'All data encrypted and stored securely on Supabase. We never share client info.'},
            {q:'What\'s included in the free trial?',a:'Full access to all features. Limited to 2 clients and 3 invoices to try it out.'}
          ].map((item,i)=>(
            <div key={i} style={{marginBottom:'24px',paddingBottom:'24px',borderBottom:'1px solid #f0f0f0'}}>
              <h3 style={{fontSize:'16px',fontWeight:700,marginBottom:'8px',margin:'0 0 8px 0'}}>{item.q}</h3>
              <p style={{fontSize:'14px',color:'#666',lineHeight:1.6,margin:0}}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section style={{background:'#f8f8f8',padding:'40px 20px'}}>
        <div style={{maxWidth:'800px',margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontSize:'28px',fontWeight:700,marginBottom:'16px'}}>Need Help?</h2>
          <p style={{fontSize:'16px',color:'#666',marginBottom:'24px'}}>Have questions or feedback? We'd love to hear from you.</p>
          <button onClick={()=>router.push('/contact')} style={{background:'#1a1a1a',color:'white',padding:'12px 28px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:600,marginRight:'12px'}}>Contact Us</button>
          <p style={{fontSize:'14px',color:'#666',marginTop:'16px'}}>Or email us at <a href='mailto:support@duemate.eu' style={{color:'#1a1a1a',textDecoration:'underline'}}>support@duemate.eu</a></p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'1px solid #f0f0f0',padding:'32px 20px',textAlign:'center',color:'#666',fontSize:'12px'}}>
        <p style={{margin:0}}>© 2026 DueMate. All rights reserved.</p>
      </footer>
    </div>
  );
}

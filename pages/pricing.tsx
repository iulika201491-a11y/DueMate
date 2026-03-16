import {useRouter} from 'next/router';
import {useEffect,useState} from 'react';
import {supabase} from '../lib/supabase';
export default function Pricing(){
  const router=useRouter();
  const [user,setUser]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [isSubscribed,setIsSubscribed]=useState(false);
  const paymentLinks: any = {
    pro: 'https://buy.stripe.com/8x25kFbnqateg0n5XhdAk00',
    plus: 'https://buy.stripe.com/14AcN7cru58Ug0nadxdAk01'
  };
  useEffect(()=>{const checkAuth=async()=>{const {data}=await supabase.auth.getSession();setUser(data?.session?.user||null);
    if(data?.session?.user){const {data:sub}=await supabase.from('subscriptions').select('status').eq('user_id',data.session.user.id).single();setIsSubscribed(sub?.status==='active');}
    setLoading(false);};checkAuth();},[]);
  const handleCheckout=(plan:string)=>{if(!user){router.push('/auth');return;}window.location.href=paymentLinks[plan];};
  if(loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div>Loading...</div></div>;
  return (
    <div style={{background:'#fff',minHeight:'100vh',color:'#1a1a1a',fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
      {/* Nav */}
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid #f0f0f0'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,margin:0,cursor:'pointer'}} onClick={()=>router.push('/')}>DueMate</h1>
        <button onClick={()=>router.push('/auth')} style={{background:'#1a1a1a',color:'white',padding:'10px 16px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'14px',fontWeight:600}}>Sign In</button>
      </nav>
      {/* Pricing */}
      <section style={{padding:'40px 20px'}}>
        <div style={{maxWidth:'1000px',margin:'0 auto'}}>
          <h2 style={{fontSize:'40px',fontWeight:700,textAlign:'center',marginBottom:'12px'}}>Simple, transparent pricing</h2>
          <p style={{fontSize:'16px',color:'#666',textAlign:'center',marginBottom:'40px'}}>All plans include invoice tracking, payment reminders, and client reliability scoring.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:'24px'}}>
            {/* Free Trial */}
            <div style={{padding:'32px',border:'1px solid #e5e7eb',borderRadius:'12px',background:'#fafafa'}}>
              <h3 style={{fontSize:'22px',fontWeight:700,marginBottom:'8px'}}>Free Trial</h3>
              <p style={{fontSize:'14px',color:'#666',marginBottom:'20px'}}>Try all features free</p>
              <div style={{fontSize:'36px',fontWeight:700,marginBottom:'20px'}}>$0<span style={{fontSize:'14px',color:'#666'}}>/7 days</span></div>
              <ul style={{listStyle:'none',padding:0,marginBottom:'24px'}}>{['Invoice tracking','2 clients (limited)','3 invoices (limited)','Client reliability scores','Automated reminders','Late fee calculator','Payment term templates'].map((i,idx)=>(<li key={idx} style={{marginBottom:'10px',fontSize:'14px',color:'#666',display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'18px'}}>✓</span>{i}</li>))}</ul>
              <button onClick={()=>user?router.push('/dashboard'):router.push('/auth')} style={{width:'100%',padding:'12px 24px',background:'#f0f0f0',color:'#1a1a1a',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600,fontSize:'14px'}}>{user?'Access Trial':'Start Free Trial'}</button>
              <p style={{fontSize:'12px',color:'#9ca3af',marginTop:'12px',textAlign:'center'}}>No credit card required</p>
            </div>
            {/* Pro Plan */}
            <div style={{padding:'32px',border:'2px solid #1a1a1a',borderRadius:'12px',background:'#1a1a1a',color:'white'}}>
              <div style={{position:'absolute',top:'-12px',left:'24px',background:'#1a1a1a',padding:'0 8px',fontSize:'12px',fontWeight:'700',color:'#999',letterSpacing:'1px'}}>POPULAR</div>
              <h3 style={{fontSize:'22px',fontWeight:700,marginBottom:'8px'}}>Pro</h3>
              <p style={{fontSize:'14px',color:'#999',marginBottom:'20px'}}>For active freelancers</p>
              <div style={{fontSize:'36px',fontWeight:700,marginBottom:'20px'}}>$12<span style={{fontSize:'14px',color:'#999'}}>/month</span></div>
              <ul style={{listStyle:'none',padding:0,marginBottom:'24px'}}>{['Everything in Free Trial','Unlimited invoices','Unlimited clients','Automated reminders (day 3 & 7)','Manual payment reminders','Client reliability scores','Late fee calculator','Payment term templates','Email alerts'].map((i,idx)=>(<li key={idx} style={{marginBottom:'10px',fontSize:'14px',color:'#eee',display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'18px'}}>✓</span>{i}</li>))}</ul>
              <button onClick={()=>handleCheckout('pro')} disabled={isSubscribed} style={{width:'100%',padding:'12px 24px',background:isSubscribed?'#666':'white',color:isSubscribed?'#999':'#1a1a1a',border:'none',borderRadius:'8px',cursor:isSubscribed?'not-allowed':'pointer',fontWeight:600,fontSize:'14px'}}>{isSubscribed?'✓ You\'re Subscribed':'Upgrade to Pro'}</button>
              <p style={{fontSize:'12px',color:'#999',marginTop:'12px',textAlign:'center'}}>First month only $1</p>
            </div>
            {/* Plus Plan */}
            <div style={{padding:'32px',border:'2px solid #7c3aed',borderRadius:'12px',background:'#faf5ff',position:'relative'}}>
              <div style={{position:'absolute',top:'-12px',left:'24px',background:'#7c3aed',color:'white',padding:'0 12px',fontSize:'12px',fontWeight:'700',letterSpacing:'1px',borderRadius:'4px'}}>RECOMMENDED</div>
              <h3 style={{fontSize:'22px',fontWeight:700,marginBottom:'8px',color:'#1a1a1a'}}>Plus</h3>
              <p style={{fontSize:'14px',color:'#666',marginBottom:'20px'}}>For serious freelancers</p>
              <div style={{fontSize:'36px',fontWeight:700,marginBottom:'20px',color:'#1a1a1a'}}>$29<span style={{fontSize:'14px',color:'#666'}}>/month</span></div>
              <ul style={{listStyle:'none',padding:0,marginBottom:'24px'}}>{['Everything in Pro','Cash flow forecasting','Advanced analytics','Payment trend insights','Client risk assessment','Automated payment scheduling','Priority support','Custom payment terms'].map((i,idx)=>(<li key={idx} style={{marginBottom:'10px',fontSize:'14px',color:'#666',display:'flex',alignItems:'center',gap:'10px'}}><span style={{fontSize:'18px',color:'#7c3aed'}}>✓</span>{i}</li>))}</ul>
              <button onClick={()=>handleCheckout('plus')} disabled={isSubscribed} style={{width:'100%',padding:'12px 24px',background:isSubscribed?'#d1d5db':'#7c3aed',color:isSubscribed?'#666':'white',border:'none',borderRadius:'8px',cursor:isSubscribed?'not-allowed':'pointer',fontWeight:600,fontSize:'14px'}}>{isSubscribed?'✓ You\'re Subscribed':'Upgrade to Plus'}</button>
              <p style={{fontSize:'12px',color:'#999',marginTop:'12px',textAlign:'center'}}>14-day free trial</p>
            </div>
          </div>

          {/* Feature Comparison */}
          <div style={{marginTop:'60px'}}>
            <h3 style={{fontSize:'24px',fontWeight:700,marginBottom:'24px',textAlign:'center'}}>Feature Comparison</h3>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'14px'}}>
                <thead>
                  <tr style={{borderBottom:'2px solid #e5e7eb'}}>
                    <th style={{padding:'12px',textAlign:'left',fontWeight:700}}>Feature</th>
                    <th style={{padding:'12px',textAlign:'center',fontWeight:700}}>Free Trial</th>
                    <th style={{padding:'12px',textAlign:'center',fontWeight:700}}>Pro</th>
                    <th style={{padding:'12px',textAlign:'center',fontWeight:700}}>Plus</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {feature:'Invoice Tracking',free:'✓',pro:'✓',plus:'✓'},
                    {feature:'Client Reliability Scores',free:'✓',pro:'✓',plus:'✓'},
                    {feature:'Automated Reminders',free:'✗',pro:'✓',plus:'✓'},
                    {feature:'Manual Reminders',free:'✓',pro:'✓',plus:'✓'},
                    {feature:'Late Fee Calculator',free:'✓',pro:'✓',plus:'✓'},
                    {feature:'Payment Terms Templates',free:'✓',pro:'✓',plus:'✓'},
                    {feature:'Cash Flow Forecasting',free:'✗',pro:'✗',plus:'✓'},
                    {feature:'Advanced Analytics',free:'✗',pro:'✗',plus:'✓'},
                    {feature:'Invoices',free:'3',pro:'Unlimited',plus:'Unlimited'},
                    {feature:'Clients',free:'2',pro:'Unlimited',plus:'Unlimited'},
                    {feature:'Support',free:'Community',pro:'Email',plus:'Priority'},
                  ].map((row,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid #e5e7eb'}}>
                      <td style={{padding:'12px',textAlign:'left'}}>{row.feature}</td>
                      <td style={{padding:'12px',textAlign:'center',color:row.free==='✓'?'#10b981':'#9ca3af'}}>{row.free}</td>
                      <td style={{padding:'12px',textAlign:'center',color:row.pro==='✓'?'#10b981':'#9ca3af'}}>{row.pro}</td>
                      <td style={{padding:'12px',textAlign:'center',color:row.plus==='✓'?'#10b981':'#9ca3af'}}>{row.plus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div style={{marginTop:'60px',maxWidth:'600px',margin:'60px auto 0'}}>
            <h3 style={{fontSize:'24px',fontWeight:700,marginBottom:'24px',textAlign:'center'}}>Billing Questions</h3>
            {[
              {q:'Can I cancel anytime?',a:'Yes. Cancel your subscription anytime with no penalties. Your data remains accessible.'},
              {q:'Do you offer refunds?',a:'Refunds available within 7 days of purchase. Contact support for assistance.'},
              {q:'What happens after the free trial?',a:'We\'ll remind you 1 day before your trial ends. Choose to upgrade or your account will pause.'},
              {q:'Is there a contract?',a:'No. Month-to-month only. Cancel anytime.'}
            ].map((f,i)=>(
              <div key={i} style={{marginBottom:'20px',paddingBottom:'20px',borderBottom:'1px solid #f0f0f0'}}>
                <h4 style={{fontSize:'15px',fontWeight:700,marginBottom:'8px',margin:'0 0 8px 0'}}>{f.q}</h4>
                <p style={{fontSize:'14px',color:'#666',lineHeight:1.6,margin:0}}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer style={{borderTop:'1px solid #f0f0f0',padding:'32px 20px',textAlign:'center',color:'#666',fontSize:'12px',marginTop:'60px'}}><p style={{margin:0}}>© 2026 DueMate. All rights reserved.</p></footer>
    </div>
  );
}

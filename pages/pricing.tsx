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

  useEffect(()=>{
    const checkAuth=async()=>{
      const {data}=await supabase.auth.getSession();
      setUser(data?.session?.user||null);
      if(data?.session?.user){
        const {data:sub}=await supabase.from('subscriptions').select('status').eq('user_id',data.session.user.id).single();
        setIsSubscribed(sub?.status==='active');
      }
      setLoading(false);
    };
    checkAuth();
  },[]);

  const handleCheckout=(plan:string)=>{
    if(!user){router.push('/auth');return;}
    window.location.href=paymentLinks[plan];
  };

  if(loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}><div>Loading...</div></div>;

  return (
    <div style={{background:'#fff',minHeight:'100vh',color:'#1a1a1a',fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'}}>
      {/* Navigation */}
      <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 20px',borderBottom:'1px solid #f0f0f0'}}>
        <h1 style={{fontSize:'20px',fontWeight:700,margin:0,cursor:'pointer'}} onClick={()=>router.push('/')}>DueMate</h1>
        <button onClick={()=>router.push('/')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'14px',color:'#666'}}>Back</button>
      </nav>

      {/* Header */}
      <section style={{padding:'40px 20px',textAlign:'center',maxWidth:'800px',margin:'0 auto'}}>
        <h1 style={{fontSize:'40px',fontWeight:700,marginBottom:'12px'}}>Simple Pricing</h1>
        <p style={{fontSize:'16px',color:'#666',marginBottom:'0}}>Start free. Upgrade when you're ready. Cancel anytime.</p>
      </section>

      {/* Pricing Cards */}
      <section style={{padding:'40px 20px'}}>
        <div style={{maxWidth:'1100px',margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))',gap:'24px'}}>
          
          {/* Free Trial Card */}
          <div style={{padding:'32px',border:'1px solid #e5e7eb',borderRadius:'12px',background:'#f9fafb',display:'flex',flexDirection:'column'}}>
            <div style={{marginBottom:'24px'}}>
              <h2 style={{fontSize:'24px',fontWeight:700,marginBottom:'8px',margin:'0 0 8px 0'}}>Free Trial</h2>
              <p style={{fontSize:'14px',color:'#666',marginBottom:'0}}>Get started free</p>
            </div>

            <div style={{marginBottom:'24px'}}>
              <div style={{fontSize:'48px',fontWeight:700,marginBottom:'4px'}}>$0</div>
              <p style={{fontSize:'14px',color:'#666',marginBottom:'0}}>7 days, then upgrade</p>
            </div>

            <button onClick={()=>user?router.push('/dashboard'):router.push('/auth')} style={{width:'100%',padding:'12px',background:'#1a1a1a',color:'white',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:600,fontSize:'14px',marginBottom:'24px'}}>
              {user?'Access Free Trial':'Start Free Trial'}
            </button>

            <div style={{fontSize:'13px',color:'#6b7280',marginBottom:'20px'}}>
              <p style={{margin:'0 0 8px 0',fontWeight:600}}>Limited to:</p>
              <ul style={{listStyle:'none',padding:0,margin:0}}>
                <li style={{marginBottom:'6px'}}>✓ 2 clients</li>
                <li style={{marginBottom:'6px'}}>✓ 3 invoices</li>
                <li style={{marginBottom:'6px'}}>✓ Manual reminders</li>
                <li>✓ Client scores</li>
              </ul>
            </div>

            <div style={{borderTop:'1px solid #e5e7eb',paddingTop:'16px',marginTop:'auto'}}>
              <p style={{fontSize:'12px',color:'#9ca3af',margin:0}}>No credit card required</p>
            </div>
          </div>

          {/* Pro Card */}
          <div style={{padding:'32px',border:'2px solid #3b82f6',borderRadius:'12px',background:'#eff6ff',display:'flex',flexDirection:'column',position:'relative'}}>
            <div style={{position:'absolute',top:'-12px',left:'20px',background:'#3b82f6',color:'white',padding:'4px 16px',fontSize:'12px',fontWeight:700,borderRadius:'4px'}}>POPULAR</div>

            <div style={{marginBottom:'24px'}}>
              <h2 style={{fontSize:'24px',fontWeight:700,marginBottom:'8px',margin:'0 0 8px 0'}}>Pro</h2>
              <p style={{fontSize:'14px',color:'#666',marginBottom:'0}}>Most freelancers</p>
            </div>

            <div style={{marginBottom:'24px'}}>
              <div style={{fontSize:'48px',fontWeight:700,marginBottom:'4px'}}>$12</div>
              <p style={{fontSize:'14px',color:'#666',marginBottom:'0}}>per month</p>
            </div>

            <button onClick={()=>handleCheckout('pro')} disabled={isSubscribed} style={{width:'100%',padding:'12px',background:isSubscribed?'#d1d5db':'#3b82f6',color:isSubscribed?'#666':'white',border:'none',borderRadius:'8px',cursor:isSubscribed?'not-allowed':'pointer',fontWeight:600,fontSize:'14px',marginBottom:'24px'}}>
              {isSubscribed?'✓ Subscribed':'Upgrade to Pro'}
            </button>

            <div style={{fontSize:'13px',color:'#1f2937'}}>
              <p style={{margin:'0 0 8px 0',fontWeight:600}}>Everything in Free Trial, plus:</p>
              <ul style={{listStyle:'none',padding:0,margin:0}}>
                <li style={{marginBottom:'6px'}}>✓ Unlimited invoices</li>
                <li style={{marginBottom:'6px'}}>✓ Unlimited clients</li>
                <li style={{marginBottom:'6px'}}>✓ Automated reminders (day 3 & 7)</li>
                <li style={{marginBottom:'6px'}}>✓ Email alerts</li>
                <li style={{marginBottom:'6px'}}>✓ Payment tracking</li>
                <li>✓ Email support</li>
              </ul>
            </div>

            <div style={{borderTop:'1px solid #e5e7eb',paddingTop:'16px',marginTop:'auto'}}>
              <p style={{fontSize:'12px',color:'#666',margin:0}}>Best for growing freelancers</p>
            </div>
          </div>

          {/* Plus Card */}
          <div style={{padding:'32px',border:'2px solid #7c3aed',borderRadius:'12px',background:'#faf5ff',display:'flex',flexDirection:'column',position:'relative'}}>
            <div style={{position:'absolute',top:'-12px',left:'20px',background:'#7c3aed',color:'white',padding:'4px 16px',fontSize:'12px',fontWeight:700,borderRadius:'4px'}}>RECOMMENDED</div>

            <div style={{marginBottom:'24px'}}>
              <h2 style={{fontSize:'24px',fontWeight:700,marginBottom:'8px',margin:'0 0 8px 0'}}>Plus</h2>
              <p style={{fontSize:'14px',color:'#666',marginBottom:'0}}>Advanced analytics</p>
            </div>

            <div style={{marginBottom:'24px'}}>
              <div style={{fontSize:'48px',fontWeight:700,marginBottom:'4px'}}>$29</div>
              <p style={{fontSize:'14px',color:'#666',marginBottom:'0}}>per month</p>
            </div>

            <button onClick={()=>handleCheckout('plus')} disabled={isSubscribed} style={{width:'100%',padding:'12px',background:isSubscribed?'#d1d5db':'#7c3aed',color:isSubscribed?'#666':'white',border:'none',borderRadius:'8px',cursor:isSubscribed?'not-allowed':'pointer',fontWeight:600,fontSize:'14px',marginBottom:'24px'}}>
              {isSubscribed?'✓ Subscribed':'Upgrade to Plus'}
            </button>

            <div style={{fontSize:'13px',color:'#1f2937'}}>
              <p style={{margin:'0 0 8px 0',fontWeight:600}}>Everything in Pro, plus:</p>
              <ul style={{listStyle:'none',padding:0,margin:0}}>
                <li style={{marginBottom:'6px'}}>✓ Cash flow forecasting</li>
                <li style={{marginBottom:'6px'}}>✓ Payment analytics</li>
                <li style={{marginBottom:'6px'}}>✓ Client payment patterns</li>
                <li style={{marginBottom:'6px'}}>✓ Risk assessment</li>
                <li style={{marginBottom:'6px'}}>✓ Advanced scoring</li>
                <li>✓ Priority support</li>
              </ul>
            </div>

            <div style={{borderTop:'1px solid #e5e7eb',paddingTop:'16px',marginTop:'auto'}}>
              <p style={{fontSize:'12px',color:'#666',margin:0}}>For serious freelancers</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{padding:'60px 20px',background:'#f9fafb'}}>
        <div style={{maxWidth:'700px',margin:'0 auto'}}>
          <h2 style={{fontSize:'32px',fontWeight:700,marginBottom:'32px',textAlign:'center'}}>Questions?</h2>
          
          {[
            {q:'How does the free trial work?',a:'7 days full access. Limited to 2 clients and 3 invoices so you can test all features. After 7 days, upgrade to Pro or Plus to continue.'},
            {q:'Can I cancel anytime?',a:'Yes. Cancel your subscription anytime with no penalties. Your data is safe and accessible for 30 days after cancellation.'},
            {q:'What\'s the difference between Pro and Plus?',a:'Pro has unlimited invoices and automated reminders. Plus adds cash flow forecasting, payment analytics, and advanced client scoring.'},
            {q:'Do you offer refunds?',a:'Yes. If you\'re not satisfied within 7 days of purchase, contact support@duemate.eu for a full refund.'},
            {q:'Can I upgrade or downgrade?',a:'Yes. Change your plan anytime. Charges and credits are pro-rated based on your billing cycle.'},
            {q:'Is my data secure?',a:'All data is encrypted and stored on Supabase. We never share your client information with anyone.'},
            {q:'What if I need help?',a:'Email support@duemate.eu anytime. Pro users get email support, Plus users get priority support.'},
            {q:'Do you have a monthly or annual option?',a:'Currently monthly only. Annual billing coming soon.'}
          ].map((item,i)=>(
            <div key={i} style={{marginBottom:'24px',paddingBottom:'24px',borderBottom:i<7?'1px solid #e5e7eb':'none'}}>
              <h3 style={{fontSize:'15px',fontWeight:700,marginBottom:'8px',margin:'0 0 8px 0'}}>{item.q}</h3>
              <p style={{fontSize:'14px',color:'#666',lineHeight:1.6,margin:0}}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{padding:'60px 20px',textAlign:'center'}}>
        <div style={{maxWidth:'600px',margin:'0 auto'}}>
          <h2 style={{fontSize:'32px',fontWeight:700,marginBottom:'16px'}}>Ready to get started?</h2>
          <p style={{fontSize:'16px',color:'#666',marginBottom:'32px'}}>Join freelancers who are tracking late payments and getting paid faster.</p>
          <button onClick={()=>user?router.push('/dashboard'):router.push('/auth')} style={{background:'#1a1a1a',color:'white',padding:'14px 40px',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'16px',fontWeight:600}}>
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'1px solid #f0f0f0',padding:'32px 20px',textAlign:'center',color:'#666',fontSize:'12px'}}>
        <p style={{margin:0}}>© 2026 DueMate. All rights reserved.</p>
      </footer>
    </div>
  );
}

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
          <h1 style={{fontSize:'32px',fontWeight:700,lineHeight:1.2,marginBottom:'16px',letterSpacing:'-1px'}}>Stop chasing late payments</h1>
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
          <h2 style={{fontSize:'28px',fontWeight:700,marginBottom:'32px',textAlign:'center'}}>Everything you need</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:'24px'}}>
            {[
              {icon:'📊',title:'Invoice Tracking',desc:'Monitor all invoices in one place. Know exactly which ones are overdue.'},
              {icon:'🔔',title:'Smart Reminders',desc:'Send automated payment reminders to clients with one click.'},
              {icon:'📈',title:'Analytics',desc:'See payment trends, average collection time, and late payment rates.'}
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
      {/* SEO Article */}
      <section style={{padding:'40px 20px',background:'#f8f8f8'}}>
        <article style={{maxWidth:'800px',margin:'0 auto'}}>
          <h2 style={{fontSize:'28px',fontWeight:700,marginBottom:'16px'}}>Why Freelancers Get Paid Late (And How to Fix It)</h2>
          <p style={{fontSize:'14px',color:'#666',marginBottom:'8px'}}>Published: March 2026 | Read time: 5 minutes</p>
          
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'24px'}}>
            Late payments are the #1 problem for freelancers. <strong>85% of freelancers experience late payments</strong>, losing an average of <strong>$5,000+ per year</strong> and wasting over 8 hours per month chasing clients for money.
          </p>

          <h3 style={{fontSize:'20px',fontWeight:700,marginBottom:'12px'}}>The Root Causes</h3>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'12px'}}>
            <strong>1. Unclear Payment Terms:</strong> Many freelancers don't set explicit due dates or payment methods. Clients don't know when payment is due.
          </p>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'12px'}}>
            <strong>2. No Automatic Reminders:</strong> You have to manually chase every late payment. By the time you follow up, 30+ days have passed.
          </p>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'12px'}}>
            <strong>3. Weak Consequences:</strong> Clients who pay late face no penalties. They learn they can delay payment without repercussions.
          </p>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'24px'}}>
            <strong>4. Lost Follow-ups:</strong> You forget to check invoices. Weeks go by before you realize a payment is overdue.
          </p>

          <h3 style={{fontSize:'20px',fontWeight:700,marginBottom:'12px'}}>The Impact on Your Business</h3>
          <ul style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'24px',paddingLeft:'20px'}}>
            <li style={{marginBottom:'8px'}}>Cash flow problems: You can't pay your own bills on time</li>
            <li style={{marginBottom:'8px'}}>Stress: Constant worry about overdue invoices</li>
            <li style={{marginBottom:'8px'}}>Wasted time: Hours spent on follow-ups instead of billable work</li>
            <li style={{marginBottom:'8px'}}>Lost revenue: Some clients never pay at all</li>
          </ul>

          <h3 style={{fontSize:'20px',fontWeight:700,marginBottom:'12px'}}>How to Fix It: 5 Proven Strategies</h3>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'12px'}}>
            <strong>1. Set Clear Payment Terms Upfront:</strong> Before starting work, send clients a contract with explicit due dates (Net 7, Net 15, Net 30), payment methods, and late fee clauses (1.5% per month is standard).
          </p>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'12px'}}>
            <strong>2. Send Invoices Immediately:</strong> Don't wait until the end of the project. Invoice for milestones as you complete them. The sooner the invoice is sent, the sooner payment is due.
          </p>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'12px'}}>
            <strong>3. Use Automated Reminders:</strong> Don't rely on memory. Set up automatic payment reminders on day 3, 7, and 14 after the due date. Early reminders get faster payments.
          </p>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'12px'}}>
            <strong>4. Require Deposits:</strong> For new or high-risk clients, ask for 50% upfront and 50% upon completion. This reduces risk and ensures commitment.
          </p>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'24px'}}>
            <strong>5. Track Payment Patterns:</strong> Identify which clients pay late consistently. Either change payment terms for repeat offenders or stop working with them.
          </p>

          <h3 style={{fontSize:'20px',fontWeight:700,marginBottom:'12px'}}>The Numbers: What Happens When You Take Action</h3>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'12px'}}>
            Freelancers who implement these strategies see:
          </p>
          <ul style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'24px',paddingLeft:'20px'}}>
            <li style={{marginBottom:'8px'}}>40% faster average payment time (from 37 days to 22 days)</li>
            <li style={{marginBottom:'8px'}}>80% reduction in late payments</li>
            <li style={{marginBottom:'8px'}}>5+ hours saved per month on follow-ups</li>
            <li style={{marginBottom:'8px'}}>$2,000-$5,000 additional annual revenue</li>
          </ul>

          <h3 style={{fontSize:'20px',fontWeight:700,marginBottom:'12px'}}>Tools That Help</h3>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'12px'}}>
            Managing all this manually is exhausting. That's why invoice tracking tools like <strong>DueMate</strong> are game-changers. They:
          </p>
          <ul style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'24px',paddingLeft:'20px'}}>
            <li style={{marginBottom:'8px'}}>Automatically track all invoices and flag overdue ones</li>
            <li style={{marginBottom:'8px'}}>Send automated reminders on your schedule</li>
            <li style={{marginBottom:'8px'}}>Calculate late fees so clients see the cost of delay</li>
            <li style={{marginBottom:'8px'}}>Show you which clients pay reliably (and which don't)</li>
            <li style={{marginBottom:'8px'}}>Forecast your cash flow based on payment patterns</li>
          </ul>

          <h3 style={{fontSize:'20px',fontWeight:700,marginBottom:'12px'}}>The Bottom Line</h3>
          <p style={{fontSize:'16px',color:'#666',lineHeight:1.8,marginBottom:'24px'}}>
            Late payments don't have to be your problem. By setting clear terms, sending timely reminders, and using the right tools, you can cut your payment delays in half and reclaim the time you waste chasing clients.
          </p>

          <div style={{background:'#1a1a1a',color:'white',padding:'24px',borderRadius:'8px',textAlign:'center'}}>
            <p style={{fontSize:'16px',marginBottom:'12px'}}>Ready to stop chasing late payments?</p>
            <button onClick={()=>router.push('/auth')} style={{background:'white',color:'#1a1a1a',padding:'12px 28px',border:'none',borderRadius:'6px',cursor:'pointer',fontSize:'14px',fontWeight:600}}>
              Try DueMate Free
            </button>
          </div>
        </article>
      </section>

      {/* CTA */}
      <section style={{background:'#1a1a1a',color:'white',padding:'40px 20px',textAlign:'center'}}>
        <h2 style={{fontSize:'28px',fontWeight:700,marginBottom:'12px'}}>Ready to stop chasing payments?</h2>
        <p style={{fontSize:'16px',color:'#ccc',marginBottom:'24px'}}>Try DueMate free for 7 days. No credit card required.</p>
        <button onClick={()=>router.push('/auth')} style={{background:'white',color:'#1a1a1a',padding:'14px 28px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'16px',fontWeight:600}}>Start Free Trial</button>
      </section>

      {/* FAQ */}
      <section style={{padding:'40px 20px'}}>
        <div style={{maxWidth:'800px',margin:'0 auto'}}>
          <h2 style={{fontSize:'28px',fontWeight:700,marginBottom:'32px',textAlign:'center'}}>Frequently Asked Questions</h2>
          {[
            {q:'How do I get paid faster?',a:'DueMate sends automated reminders to clients on day 3, 7, and 14 after the due date. You can also manually send reminders anytime. Most freelancers see 40% faster payments.'},
            {q:'Can I set payment terms with clients?',a:'Yes! Download professional payment term templates (Net 7/15/30/45, 50/50 Milestone, Deposit + Balance) directly from your dashboard. They include built-in late fee clauses.'},
            {q:'What if a client doesn\'t pay?',a:'Use the late fee calculator to show clients exactly how much they owe including late fees (1.5% per month). Plus plan includes client reliability scoring to identify risky clients.'},
            {q:'How do I track late payments?',a:'Dashboard shows overdue invoices with days overdue highlighted. Summary cards show total owed, overdue count, and late payment statistics.'},
            {q:'Can I send automatic reminders?',a:'Yes. Pro and Plus plans include automated reminder sequences. Set it once, reminders send automatically on your schedule.'},
            {q:'Is my data secure?',a:'All data is encrypted and stored securely on Supabase. We never share your client information. Two-factor authentication available.'},
            {q:'Can I cancel anytime?',a:'Yes. Cancel your subscription anytime with no penalties. Your data remains accessible.'},
            {q:'What\'s included in each plan?',a:'Free Trial (7 days): 5 invoices, 3 clients. Pro ($12/mo): unlimited invoices, reminders. Plus ($29/mo): analytics, cash flow forecasting, client scoring.'},
            {q:'Do you offer invoicing templates?',a:'Yes. Payment term templates cover all common scenarios. Customize with your details and download as PDF or text files.'},
            {q:'How do late fees work?',a:'Use the built-in calculator to compute late fees at 1.5% per month (18% annually). Templates include these terms so clients know upfront.'}
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
          <p style={{fontSize:'14px',color:'#666',marginTop:'16px'}}>Or email us directly at <a href='mailto:support@duemate.eu' style={{color:'#1a1a1a',textDecoration:'underline'}}>support@duemate.eu</a></p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{borderTop:'1px solid #f0f0f0',padding:'32px 20px',textAlign:'center',color:'#666',fontSize:'12px'}}>
        <p style={{margin:0}}>© 2026 DueMate. All rights reserved.</p>
      </footer>
    </div>
  );
}

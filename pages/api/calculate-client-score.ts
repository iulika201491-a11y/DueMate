import { supabase } from '../../lib/supabase';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, clientId } = req.body;

  if (!userId || !clientId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Get all invoices for this client
    const { data: invoices, error: invoiceError } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId)
      .eq('client_id', clientId);

    if (invoiceError) throw invoiceError;

    if (!invoices || invoices.length === 0) {
      return res.status(200).json({
        reliabilityScore: 100,
        riskLevel: 'unknown',
        totalInvoices: 0,
        paidInvoices: 0,
        overdueInvoices: 0,
        avgDaysToPay: 0
      });
    }

    // Calculate metrics
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status !== 'pending').length;
    const overdueInvoices = invoices.filter(
      inv => inv.status === 'pending' && new Date(inv.due_date) < new Date()
    ).length;

    // Calculate average days to pay (only for paid invoices)
    const paidWithDates = invoices.filter(inv => inv.paid_date && inv.due_date);
    const avgDaysToPay = paidWithDates.length > 0
      ? Math.round(
          paidWithDates.reduce((sum, inv) => {
            const due = new Date(inv.due_date);
            const paid = new Date(inv.paid_date);
            const days = Math.floor((paid.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
            return sum + Math.max(0, days); // Don't count early payments negatively
          }, 0) / paidWithDates.length
        )
      : 0;

    // Calculate reliability score (0-100)
    // Factors:
    // - 50% payment rate (paid vs total)
    // - 30% on-time payment (negative for late)
    // - 20% current overdue status
    const paymentRate = (paidInvoices / totalInvoices) * 100;
    const onTimeRate = paidWithDates.length > 0
      ? (paidWithDates.filter(inv => {
          const days = Math.floor(
            (new Date(inv.paid_date!).getTime() - new Date(inv.due_date).getTime()) /
            (1000 * 60 * 60 * 24)
          );
          return days <= 0;
        }).length / paidWithDates.length) * 100
      : 0;

    const overduePercentage = (overdueInvoices / totalInvoices) * 100;

    const reliabilityScore = Math.round(
      (paymentRate * 0.5) +
      (onTimeRate * 0.3) -
      (overduePercentage * 0.2)
    );

    // Determine risk level
    let riskLevel = 'low';
    if (reliabilityScore >= 80) riskLevel = 'low';
    else if (reliabilityScore >= 60) riskLevel = 'medium';
    else if (reliabilityScore >= 40) riskLevel = 'high';
    else riskLevel = 'critical';

    // Save to client_statistics
    const { error: updateError } = await supabase
      .from('client_statistics')
      .upsert(
        {
          user_id: userId,
          client_id: clientId,
          total_invoices: totalInvoices,
          paid_invoices: paidInvoices,
          overdue_invoices: overdueInvoices,
          avg_days_to_pay: avgDaysToPay,
          payment_reliability_score: reliabilityScore,
          risk_level: riskLevel,
          last_updated: new Date().toISOString()
        },
        { onConflict: 'user_id,client_id' }
      );

    if (updateError) throw updateError;

    return res.status(200).json({
      reliabilityScore: Math.max(0, reliabilityScore),
      riskLevel,
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      avgDaysToPay
    });
  } catch (error: any) {
    console.error('Score calculation error:', error);
    return res.status(500).json({ error: error.message || 'Failed to calculate score' });
  }
}

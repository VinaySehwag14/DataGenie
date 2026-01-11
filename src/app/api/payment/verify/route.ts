import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            plan
        } = await req.json()

        const body = razorpay_order_id + "|" + razorpay_payment_id

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex")

        const isAuthentic = expectedSignature === razorpay_signature

        if (isAuthentic) {
            // Update user subscription in Supabase
            const supabase = await createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
            }

            // Update workspace (assuming 1 workspace per user for MVP)
            const { error } = await supabase
                .from('workspaces')
                .update({
                    subscription_plan: plan,
                    subscription_status: 'active',
                    razorpay_customer_id: razorpay_payment_id, // Storing payment ID as reference for MVP
                    razorpay_subscription_id: razorpay_order_id
                })
                .eq('user_id', user.id)

            if (error) {
                console.error('Supabase update error:', error)
                return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
            }

            return NextResponse.json({
                message: "success",
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
            })
        } else {
            return NextResponse.json(
                { message: "fail" },
                { status: 400 }
            )
        }
    } catch (error) {
        console.error('Verification Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

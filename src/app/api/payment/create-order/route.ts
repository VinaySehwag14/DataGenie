import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import shortid from 'shortid'

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: NextRequest) {
    if (req.method !== 'POST') {
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
    }

    try {
        const { amount, currency = 'INR' } = await req.json()

        const options = {
            amount: (amount * 100).toString(), // Razorpay expects amount in paise
            currency,
            receipt: shortid.generate(),
        }

        const order = await razorpay.orders.create(options)

        return NextResponse.json(order)
    } catch (error) {
        console.error('Razorpay Error:', error)
        return NextResponse.json({ error: 'Error creating order' }, { status: 500 })
    }
}

import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (WEBHOOK_SECRET === undefined) {
        throw new Error('WEBHOOK_SECRET is undefined')
    }
    // headers
    const headerPayload = await headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400,
        })
    }

    // body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Svix instance
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent
    } catch (err) {
        console.error('Error verifying webhook:', err)
        return new Response('Error occured', {
            status: 400,
        })
    }

    // Handle the webhook event here
    const { id } = evt.data
    const eventType = evt.type

    if (eventType === 'user.created') {
        // Example: save the user to the database once you define the User model in Prisma schema
        try {
            await prisma.user.create({
                data: {
                    id: id!,
                    email: evt.data.email_addresses[0].email_address,
                    credits: 2
                }
            })
            console.log(`User ${id} was created via webhook!`)
        } catch (error) {
            console.error('Błąd Prisma podczas zapisu do bazy:', error)
        }
    }

    return NextResponse.json({ message: 'Webhook processed' }, { status: 200 })
}
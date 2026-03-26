import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });
        if (!user) {
            return NextResponse.json({ credits: 0 });
        }

        return NextResponse.json({ credits: user.credits });

    } catch (error) {
        console.error("Błąd pobierania kredytów:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = await params;

        const interview = await prisma.interview.findUnique({
            where: { id }
        });

        if (!interview || interview.userId !== userId) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Delete all associated messages first, then the interview
        await prisma.$transaction([
            prisma.message.deleteMany({ where: { interviewId: id } }),
            prisma.interview.delete({ where: { id } })
        ]);

        return new NextResponse("OK", { status: 200 });
    } catch (error) {
        console.error("Błąd podczas usuwania wywiadu:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

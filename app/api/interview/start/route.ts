import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { credits: true }
        });

        if (!user || user.credits <= 0) {
            return new NextResponse("Brak wystarczających kredytów", { status: 403 });
        }

        const interview = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { credits: { decrement: 1 } }
            });

            return await tx.interview.create({
                data: {
                    userId: userId,
                    jobTitle: "Rozmowa - AI Mock Interview",
                    status: "IN_PROGRESS",
                }
            });
        });

        return NextResponse.json({ interviewId: interview.id });

    } catch (error) {
        console.error("Błąd podczas tworzenia wywiadu:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
